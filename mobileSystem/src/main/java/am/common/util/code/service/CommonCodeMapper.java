package am.common.util.code.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper("commonCodeMapper")
public interface CommonCodeMapper {

	/**
	 * 공통 코드
	 *
	 * @param param
	 * @return
	 * @throws Exception
	 */
	public List<HashMap<String, String>> getCommonCode(Map<String, Object> param) throws Exception;

	/**
	 * 권한 코드
	 *
	 * @param param
	 * @return
	 * @throws Exception
	 */
	public List<HashMap<String, String>> getAuthCode(Map<String, Object> param) throws Exception;


	/**
	 * 시군구 코드
	 *
	 * @param param
	 * @return
	 * @throws Exception
	 */
	public List<HashMap<String, String>> getSggB(Map<String, Object> param) throws Exception;

	/**
	 * 읍명동 코드
	 *
	 * @param param
	 * @return
	 * @throws Exception
	 */
	public List<HashMap<String, String>> getEmdB(Map<String, Object> param) throws Exception;
	
	/**
	 * 리 코드
	 *
	 * @param param
	 * @return
	 * @throws Exception
	 */
	public List<HashMap<String, String>> getRiB(Map<String, Object> param) throws Exception;
	
	/**
	 * 판독 리스트 엑셀 다운로드
	 * 
	 * @param param
	 * @return
	 * @throws Exception
	 */
	public List<?> getExcel(HashMap<String, Object> param) throws Exception;

}
