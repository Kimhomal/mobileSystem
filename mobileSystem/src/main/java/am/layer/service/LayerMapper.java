package am.layer.service;

import java.util.HashMap;
import java.util.List;

import egovframework.rte.psl.dataaccess.mapper.Mapper;
import egovframework.rte.psl.dataaccess.util.EgovMap;

@Mapper("layerMapper")
public interface LayerMapper {

    // 레이어 정보 조회
    public List<?> getLayerList(HashMap<String, Object> params) throws Exception;
    
    public List<?> getHcsList(HashMap<String, Object> params) throws Exception;
    
	public List<?> getCenterRoadList(HashMap<String, Object> params) throws Exception;
	
	public List<?> getPaveRoadList(HashMap<String, Object> params) throws Exception;
	
	public void uploadImage(HashMap<String, Object> params) throws Exception;
	
	// 이미지 정보 조회
    public List<?> getImages(HashMap<String, Object> params) throws Exception;
    
    // 이미지 정보 조회
    public HashMap getFeatureInfo(HashMap<String, Object> params) throws Exception;
    
    // 사용자별 사진 입력 정보 가져오기
    public List<?> getImageInfoList(HashMap<String, Object> params) throws Exception;
    
    // 사진 입력 정보 추가
    public void insertImageInfoList(HashMap<String, Object> params) throws Exception;
    
    // 사진 입력 정보 갱신
    public void updateImageInfoList(HashMap<String, Object> params) throws Exception;
}
