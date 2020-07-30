package am.map.service.impl;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import am.map.com.RequestUtil;
import am.map.com.WFSXmlCreator;
import am.map.service.WFSXmlService;

@Service("wfsXmlService")
public class WFSXmlServiceImpl implements WFSXmlService {

	private static final Logger LOGGER = LoggerFactory.getLogger(WFSXmlServiceImpl.class);

	private static WFSXmlServiceImpl instance = null;

	public synchronized static WFSXmlServiceImpl getInstance() {
		if (instance == null)
			instance = new WFSXmlServiceImpl();
		return instance;
	}

	/**
	 * Literal 기반 GetFeature
	 *
	 * @throws TransformerException
	 * @throws ParserConfigurationException
	 * @throws UnsupportedEncodingException
	 */
	public String GetFeatureFromLiteral(HashMap<String, Object> params) throws UnsupportedEncodingException, ParserConfigurationException, TransformerException {
		WFSXmlCreator xmlCreator = new WFSXmlCreator();
		String requestXml = xmlCreator.getIntersectsFromLiteral((String)params.get("layers"), (String)params.get("propName"), (String)params.get("literals"), (String)params.get("srsName"));
		// LOGGER.debug(requestXml);
		RequestUtil requestUtil = new RequestUtil("UTF-8", "xml");
		String responseXml = requestUtil.post((String)params.get("wfsUrl"), requestXml);
		// LOGGER.debug(responseXml);
		return responseXml;
	}
	/**
	 * Literal 기반 GetFeature
	 *
	 * @throws TransformerException
	 * @throws ParserConfigurationException
	 * @throws UnsupportedEncodingException
	 */
	public String GetFeatureFromLiterals(HashMap<String, Object> params) throws UnsupportedEncodingException, ParserConfigurationException, TransformerException {
		WFSXmlCreator xmlCreator = new WFSXmlCreator();
		String requestXml = xmlCreator.getIntersectsFromLiterals((String)params.get("layers"), (String)params.get("propName"), (String)params.get("literals"), (String)params.get("srsName"));
		// LOGGER.debug(requestXml);
		RequestUtil requestUtil = new RequestUtil("UTF-8", "xml");
		String responseXml = requestUtil.post((String)params.get("wfsUrl"), requestXml);
		// LOGGER.debug(responseXml);
		return responseXml;
	}

	/**
	 * Point 기반 검색레이어들 GetFeature
	 *
	 * @throws TransformerException
	 * @throws ParserConfigurationException
	 * @throws UnsupportedEncodingException
	 */
	public String GetFeatureFromPoint(HashMap<String, Object> params) throws UnsupportedEncodingException, ParserConfigurationException, TransformerException {
		WFSXmlCreator xmlCreator = new WFSXmlCreator();
		String requestXml = xmlCreator.getIntersectsFromPoint((String)params.get("layers"), (String)params.get("coords"), (String)params.get("srsName"));
		// LOGGER.debug(requestXml);
		RequestUtil requestUtil = new RequestUtil("UTF-8", "xml");
		String responseXml = requestUtil.post((String)params.get("wfsUrl"), requestXml);
		// LOGGER.debug(responseXml);
		return responseXml;
	}

	/**
	 * Polygon 기반 검색레이어들 GetFeature
	 *
	 * @throws TransformerException
	 * @throws ParserConfigurationException
	 * @throws UnsupportedEncodingException
	 */
	public String GetFeatureFromPolygon(HashMap<String, Object> params) throws UnsupportedEncodingException, ParserConfigurationException, TransformerException {
		WFSXmlCreator xmlCreator = new WFSXmlCreator();
		String requestXml = xmlCreator.getIntersectsFromPolygon((String)params.get("layers"), (String)params.get("coords"), (String)params.get("srsName"));
		// LOGGER.debug(requestXml);
		RequestUtil requestUtil = new RequestUtil("UTF-8", "xml");
		String responseXml = requestUtil.post((String)params.get("wfsUrl"), requestXml);
		// LOGGER.debug(responseXml);
		return responseXml;
	}

}
