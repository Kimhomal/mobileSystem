package am.map.service;

import java.util.HashMap;

import org.springframework.transaction.annotation.Transactional;

@Transactional
public interface WFSXmlService {

	public String GetFeatureFromLiteral(HashMap<String, Object> params) throws Exception;
	public String GetFeatureFromLiterals(HashMap<String, Object> params) throws Exception;

	public String GetFeatureFromPoint(HashMap<String, Object> params) throws Exception;

	public String GetFeatureFromPolygon(HashMap<String, Object> params) throws Exception;

}
