package am.common.util.code.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public interface CommonCodeService {

	public List<HashMap<String, String>> getCodeList(Map<String, Object> params) throws Exception;
	
	public List<?> getExcel(HashMap<String, Object> param) throws Exception;
}
