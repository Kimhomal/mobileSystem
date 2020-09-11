package am.layer.service;

import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.transaction.annotation.Transactional;

import egovframework.rte.psl.dataaccess.util.EgovMap;

@Transactional
public interface LayerService {
    
    // 레이어 목록 조회
    public List<?> getLayerList(HashMap<String, Object> params) throws Exception;
    
    public List<?> getHcsList(HashMap<String, Object> params) throws Exception;
    
	public HashMap getRoadHcsList(HashMap<String, Object> params) throws Exception;
	
	public void uploadImage(HashMap<String, Object> params, HttpServletRequest request) throws Exception;
	
	// 이미지 정보 조회
    public List<?> getImages(HashMap<String, Object> params) throws Exception;
    
    // 객체 정보 조회
    public HashMap getFeatureInfo(HashMap<String, Object> params) throws Exception;
    
    // 사용자별 사진 입력 정보 가져오기
    public List<?> getImageInfoList(HashMap<String, Object> params) throws Exception;
    
    // 사진 입력 정보 갱신
    public void updateImageInfo(HashMap<String, Object> params, HttpServletRequest request) throws Exception;
}
