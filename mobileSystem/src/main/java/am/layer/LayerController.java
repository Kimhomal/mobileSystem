package am.layer;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import com.git.iface.ITableInfo;
import com.git.iface.tableinfo.TableInfoReader;

import am.layer.service.LayerService;
import am.main.service.impl.AuthVO;

@Controller
public class LayerController {

    @Resource(name = "layerService")
    private LayerService masterService;

    @RequestMapping(value = "/layer/map.do")
    public String initStatusFacilityPage(AuthVO vo, HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
    	String path = request.getSession().getServletContext().getRealPath("/html");
    	ITableInfo reader = TableInfoReader.getInstance(path);
        return "mapPage";
    }
    
    /**
     * 횡단면도 정보 가져오기
     *
     * @param params
     * @param model
     * @return
     * @throws Exception
     */
    @RequestMapping(value = "/layer/getHcsList", method = RequestMethod.POST, produces = { MediaType.APPLICATION_JSON_VALUE })
	public ModelMap getHcsList(@RequestParam HashMap<String, Object> params, ModelMap model) throws Exception {
    	String[] showList = {"ftr_idn", "ftr_cde", "pip_lbl", "x", "y", "type"};
    	
		List<?> roadList = masterService.getRoadHcsList(params);
		List<?> pipeResult = masterService.getHcsList(params);
		
		List<HashMap<String, Object>> pipeList = new ArrayList<HashMap<String, Object>>();
		for(int i=0; i < pipeResult.size(); i++) {
			HashMap<String, Object> temp = new HashMap<String, Object>();
			for(int j=0; j < showList.length; j++) {
				HashMap<String, Object> pipe = (HashMap<String, Object>) pipeResult.get(i);
				temp.put(showList[j], pipe.get(showList[j]));
			}
			
			pipeList.add(temp);
		}
		
		HashMap<String, Object> fields = new HashMap<String, Object>();
		for(int i=0; i < showList.length; i++) {
			String fieldName = TableInfoReader.getInstance(null).fieldName("wtl_pipe_lm", showList[i], ITableInfo.LANG_OPTION.KOR);
			if(fieldName == null) {
				fields.put(showList[i], showList[i]);
    		} else {
    			fields.put(showList[i], fieldName);
    		}
			
		}

		HashMap<String, Object> jsonMap = new HashMap<String, Object>();
		jsonMap.put("params", params);
		jsonMap.put("roadList", roadList);
		jsonMap.put("pipeList", pipeList);
		jsonMap.put("fields", fields);

		model.addAttribute("jsonView", jsonMap);
		return model;
	}
    
    /**
     * 레이어 전체 리스트 가져오기
     *
     * @param params
     * @param model
     * @return
     * @throws Exception
     */
    @RequestMapping(value = "/layer/getLayerList", method = RequestMethod.POST, produces = { MediaType.APPLICATION_JSON_VALUE })
    public ModelMap getLayerList(@RequestParam HashMap<String, Object> params, ModelMap model) throws Exception {
    	List<?> layers = masterService.getLayerList(params);

        HashMap<String, Object> jsonMap = new HashMap<String, Object>();
        jsonMap.put("layers", layers);

        model.addAttribute("jsonView", jsonMap); // JSON으로 리턴하기 위해서는 모델키를 'jsonView'로 지정해야함

        return model;
    }
    
    /**
     * 사진 업로드
     *
     * @param params
     * @param model
     * @return
     * @throws Exception
     */
    @RequestMapping(value = "/layer/uploadImage", method = RequestMethod.POST, produces = { MediaType.APPLICATION_JSON_VALUE })
    public ModelMap uploadImage(@RequestParam HashMap<String, Object> params, ModelMap model, HttpSession session, HttpServletRequest request) throws Exception {
    	AuthVO auth = (AuthVO) session.getAttribute("authInfo");
        String userId = auth.getUserId();
        params.put("userId", userId);
        
        HashMap<String, Object> jsonMap = new HashMap<String, Object>();
        
        try {
            masterService.uploadImage(params, request); // tbl_result_repot
            jsonMap.put("respFlag", "Y");
        } catch (Exception e) {
            jsonMap.put("respFlag", "N");
        }
        model.addAttribute("jsonView", jsonMap); // JSON으로 리턴하기 위해서는 모델키를 'jsonView'로 지정해야함

        return model;
    }
    
    /**
     * 사진 정보 가져오기
     *
     * @param params
     * @param model
     * @return
     * @throws Exception
     */
    @RequestMapping(value = "/layer/getImages", method = RequestMethod.POST, produces = { MediaType.APPLICATION_JSON_VALUE })
    public ModelMap getImages(@RequestParam HashMap<String, Object> params, ModelMap model, HttpSession session, HttpServletRequest request) throws Exception {
    	List<?> images = masterService.getImages(params);

        HashMap<String, Object> jsonMap = new HashMap<String, Object>();
        jsonMap.put("images", images);

        model.addAttribute("jsonView", jsonMap); // JSON으로 리턴하기 위해서는 모델키를 'jsonView'로 지정해야함

        return model;
    }
    
    /**
     * 객체 정보 가져오기
     *
     * @param params
     * @param model
     * @return
     * @throws Exception
     */
    @RequestMapping(value = "/layer/getFeatureInfo", method = RequestMethod.POST, produces = { MediaType.APPLICATION_JSON_VALUE })
    public ModelMap getFeatureInfo(@RequestParam HashMap<String, Object> params, ModelMap model, HttpSession session, HttpServletRequest request) throws Exception {
    	HashMap result = masterService.getFeatureInfo(params);
    	
    	String layerName = (String)params.get("layerNm");
    	
    	Iterator<String> iter = result.keySet().iterator();
    	
    	HashMap<String, Object> values = new HashMap<String, Object>();
    	HashMap<String, Object> fields = new HashMap<String, Object>();
    	
    	
    	while(iter.hasNext()) {
    		String key = (String)iter.next();
    		String value = String.valueOf(result.get(key));
//    		String value = (String)result.get(key);
    		
    		String valueName = TableInfoReader.getInstance(null).codeName("FTR001", value, ITableInfo.LANG_OPTION.KOR);
    		if(valueName == null) {
    			values.put(key, value);
    		} else {
    			values.put(key, valueName);
    		}
    		
    		String fieldName = TableInfoReader.getInstance(null).fieldName(layerName, key, ITableInfo.LANG_OPTION.KOR);
    		if(fieldName == null) {
    			fields.put(key, key);
    		} else {
    			fields.put(key, fieldName);
    		}
    	}
        HashMap<String, Object> jsonMap = new HashMap<String, Object>();
        jsonMap.put("result", values);
        jsonMap.put("fields", fields);

        model.addAttribute("jsonView", jsonMap); // JSON으로 리턴하기 위해서는 모델키를 'jsonView'로 지정해야함

        return model;
    }
}
