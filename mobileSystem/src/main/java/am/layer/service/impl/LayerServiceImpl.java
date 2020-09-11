package am.layer.service.impl;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import am.common.util.com.ComDateUtils;
import am.common.util.com.FileUtil;
import am.layer.service.LayerMapper;
import am.layer.service.LayerService;
import egovframework.com.cmm.service.EgovProperties;
import egovframework.rte.psl.dataaccess.util.EgovMap;

@Service("layerService")
public class LayerServiceImpl implements LayerService {

    @Resource(name = "layerMapper")
    private LayerMapper masterMapper;
    
    // 모든 레이어 조회
    @Override
    public List<?> getLayerList(HashMap<String, Object> params) throws Exception {
        return masterMapper.getLayerList(params);
    }
    
    @Override
	public List<?> getHcsList(HashMap<String, Object> params) throws Exception {
		return masterMapper.getHcsList(params);
	}
	@Override
	public HashMap getRoadHcsList(HashMap<String, Object> params) throws Exception {
		HashMap<String, Object> jsonMap = new HashMap<String, Object>();
		jsonMap.put("centerRoad", masterMapper.getCenterRoadList(params));
		jsonMap.put("paveRoad", masterMapper.getPaveRoadList(params));
		return jsonMap;
	}
	
	@Override
	public void uploadImage(HashMap<String, Object> params, HttpServletRequest request) throws Exception {
		String saveOpt = (String) params.get("infoSave");
		if(saveOpt.equals("true")) {
			updateImageInfo(params, request);
		}
		
		final Map<String, MultipartFile> files = ((MultipartHttpServletRequest) request).getFileMap();
        Iterator<Map.Entry<String, MultipartFile>> itr = files.entrySet().iterator();
        int fileNo = 0;
        while (itr.hasNext()) {
            String saveFileName = "IMAGE" + ComDateUtils.getCurDate("yyMMddHHmmss") + fileNo;
            fileNo++;
            Entry<String, MultipartFile> fileEntry = itr.next();
            String FilePath = FileUtil.writeFileSave(fileEntry, saveFileName, EgovProperties.getProperty("Globals.fileStorePath") + "/IMAGE");

            params.put("fileNm", fileEntry.getValue().getOriginalFilename());
            params.put("svFileNm", saveFileName);
            params.put("filePath", FilePath);

            masterMapper.uploadImage(params);
        }
	}
	
	// 모든 이미지 정보 조회
    @Override
    public List<?> getImages(HashMap<String, Object> params) throws Exception {
    	List<?> results = masterMapper.getImages(params);
    	
    	for(int i = 0; i < results.size() ;i++) {
    		EgovMap temp = (EgovMap) results.get(i);
    		String base64 = FileUtil.toBase64(temp);
    		temp.put("base64", base64);
    	}
    	
    	return results;
    }
    
    // 객체 정보 조회
    @Override
    public HashMap getFeatureInfo(HashMap<String, Object> params) throws Exception {
    	HashMap results = masterMapper.getFeatureInfo(params);
    	
    	return results;
    }
    
    // 사용자별 사진 입력 정보 가져오기
    @Override
    public List<?> getImageInfoList(HashMap<String, Object> params) throws Exception {
    	return masterMapper.getImageInfoList(params);
    }
    
    // 사진 입력 정보 갱신
    @Override
    public void updateImageInfo(HashMap<String, Object> params, HttpServletRequest request) throws Exception{
    	List<?> infoList = getImageInfoList(params);
    	
    	if(infoList.isEmpty()) {
    		// 사용자 정의 입력 정보가 존재하지않을 때 새로 입력
    		masterMapper.insertImageInfoList(params);
    	} else {
    		// 사용자 정의 입력 정보가 존재할 때 갱신
    		masterMapper.updateImageInfoList(params);
    	}
    }
}
