package am.common.util.code;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import am.common.annotation.AuthExclude;
import am.common.util.code.service.CommonCodeService;
import am.common.util.com.ComStringUtils;
import am.common.util.com.EgovExcel;
import am.common.util.com.FileUtil;
import am.main.service.impl.AuthVO;
import egovframework.com.cmm.service.EgovProperties;

@Controller
public class CommonCodeController {

	@Resource(name = "commonCodeService")
	private CommonCodeService commonCodeService;

//	@AuthExclude
	@RequestMapping(value="/common/util/code/combobox.json", method=RequestMethod.GET, produces={MediaType.APPLICATION_JSON_VALUE})
	public ModelMap comboboxJson(@RequestParam Map<String, Object> params, ModelMap model) throws Exception {

		ArrayList<String[]> rslt = new ArrayList<String[]>(); // JSON 리턴값

		List<HashMap<String, String>> codeList = commonCodeService.getCodeList(params);

		for (int i = 0; i < codeList.size(); i++) {
			HashMap<String, String> map = codeList.get(i);
			rslt.add(new String[]{map.get("value"), map.get("name")});
		}
		model.addAttribute("jsonView", rslt);
		return model;
	}

	@RequestMapping(value = "/common/util/code/getExcel.do")
	public void getExcel(@RequestParam HashMap<String, Object> params, HSSFWorkbook workbook, HttpServletRequest request, HttpServletResponse response) throws Exception {
//		String[] arrHeader = {"번호", "프로젝트 명", "판독일시", "판독상태", "판독유형", "주소", "판독사", "비고"};
//		reqParams.put("arrHeader", arrHeader);
//		reqParams.put("sheetName", "프로젝트 리스트");
//		reqParams.put("fileName", "projectList");
		AuthVO auth = (AuthVO) request.getSession().getAttribute("authInfo");
		
		// 검색시 판독 유형 체크 된 것 확인
		String checkBox = (String)params.get("checkArr");
		
		//구/군 소속일 경우 관할 구만 권한 가짐
		if(auth.getUserPrivil().equals("PRI03")){
			params.put("userOrgan", auth.getUserOrgan());
		}
		
		// 페이지가 처음 로딩될 때 checkBox = null 
		if(checkBox!= null){//파라미터값에 배열값 넣기 
			ArrayList<HashMap<String, String>> list = new ArrayList<>();
			String[] arrCheckbox = checkBox.split(",");
	    	
	    	for(int i = 0; i < arrCheckbox.length; i+=2){
	    		HashMap<String, String> map = new HashMap<String, String>();
	    		map.put("type", arrCheckbox[i]);
	    		map.put("searchGb", arrCheckbox[i+1]);
	    		
	    		list.add(map);
	    	}
	    	params.put("checkList", list);
		} else {
			
			// 구/군청 , 시청일 경우 부서 별 검색 조건 다르게 설정
			if(!auth.getUserPrivil().equals("PRI01")){
				String organCd = auth.getOrganCd(); 
				String searchBf = "0";
				if(organCd.contains("FEZ")){
					searchBf = "1";
				}
				params.put("searchBf", searchBf);
				ArrayList<HashMap<String, String>> typeList = auth.getTypeList();
				if(typeList != null) {
					params.put("checkList", typeList);
				}
			}
		}
		
		String header = (String) params.get("arrHeader");
		String[] arrHeader = header.split(",");

		params.put("arrHeader", arrHeader);
		params.put("sheetName", params.get("sheetName").toString()); 
		params.put("fileName", params.get("fileName").toString());
		
		
		List<?> resultList = commonCodeService.getExcel(params);
		params.put("dataList", resultList);

		EgovExcel.buildExcelDocument(params, workbook, request, response);
	}
	
	@RequestMapping(value = "/getAirFileImage.do")
	public void getFeatureImage(@RequestParam HashMap<String,Object> params,HttpServletRequest request, ModelMap model, HttpServletResponse response) throws Exception{
		String uploadPath = EgovProperties.getProperty("Globals.fileStorePath") + "/result_img/";
		String fileNam = (String) params.get("fileNm")+".png";
		FileUtil.setImage(ComStringUtils.filterSystemPath(uploadPath+fileNam),fileNam,response);
	}
}
