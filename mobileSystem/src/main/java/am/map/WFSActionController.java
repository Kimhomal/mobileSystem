package am.map;

import java.io.IOException;
import java.util.HashMap;

import javax.annotation.Resource;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import am.common.annotation.AuthExclude;
import am.map.service.WFSXmlService;
import egovframework.com.cmm.service.EgovProperties;

@Controller
public class WFSActionController {

	@Resource(name = "wfsXmlService")
	private WFSXmlService wfsXmlService;

	private static final Logger logger = LoggerFactory.getLogger(WFSActionController.class);

	/**
	 * 피처 정보 가져오기.
	 *
	 * @return "map/GetWFSxml"
	 * @throws Exception
	 */
	@AuthExclude
	@RequestMapping(value = "/map/GetFeatureInfo", method = RequestMethod.POST, produces = { MediaType.APPLICATION_JSON_VALUE })
	public ModelMap GetFeatureInfo(@RequestParam HashMap<String, Object> params, ModelMap model) throws Exception {

		HashMap<String, Object> jsonMap = new HashMap<String, Object>();

		try {
			String type = ((String) params.get("type")).toUpperCase();

			params.put("wfsUrl", EgovProperties.getGISProperty("GeoServer.WFS"));

			String result = "";

			 if (type.equals("LITERAL")) {
						String layers = (String)params.get("layers");
						params.put("layers", layers.split(",")[0]);
						if(layers.split(",").length > 1){
							params.put("propName",layers.replace(layers.split(",")[0]+",", ""));
							result = wfsXmlService.GetFeatureFromLiterals(params);
						}
					} 

			jsonMap.put("jsonView", result);

		} catch (IOException e) {
			logger.debug(e.getMessage());
		} catch (TransformerException e) {
			logger.debug(e.getMessage());
		} catch (ParserConfigurationException e) {
			logger.debug(e.getMessage());
		}

		model.addAttribute("jsonView", jsonMap); // JSON으로 리턴하기 위해서는 모델키를 'jsonView'로 지정해야함

		return model;
	}
}
