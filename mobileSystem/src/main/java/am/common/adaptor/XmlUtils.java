package am.common.adaptor;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import javax.annotation.Resource;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

//import com.sncinfo.cmmn.adaptor.WebServiceConnectionAdaptor;

public class XmlUtils 
{
	private static final Logger LOGGER = LoggerFactory.getLogger(XmlUtils.class);
	
//	@Resource(name = "httpSoapAdaptor")
//	private WebServiceConnectionAdaptor httpSoapAdaptor;
	
//	@Resource(name = "httpUrlAdaptor")
//	private WebServiceConnectionAdaptor httpUrlAdaptor;

	public XmlUtils() {}

	public List<HashMap<String, Object>> requestXmlData(String msg, String exp) throws Exception {
		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		factory.setNamespaceAware(true);

		DocumentBuilder builder = null;
		Document xmlDoc = null;
		XPathExpression expr = null;
		Object result = null;
		List<HashMap<String, Object>> resList = new ArrayList<HashMap<String, Object>>();

		try {
			builder = factory.newDocumentBuilder();
			xmlDoc = builder.parse(new InputSource(new StringReader(msg)));

			XPathFactory xpf = XPathFactory.newInstance();
			XPath xp = xpf.newXPath();

			expr = xp.compile(exp);
			result = expr.evaluate(xmlDoc, XPathConstants.NODESET);
			NodeList resultNodeList = (NodeList) result;
			HashMap<String, Object> resMap;
			for (int i = 0; i < resultNodeList.getLength(); i++) {
				Node child = resultNodeList.item(i);
				NodeList childNodeList = (NodeList) child.getChildNodes();
				resMap = new HashMap<String, Object>();
				for (int j = 0; j < childNodeList.getLength(); j++) {
					Node cchild = childNodeList.item(j);
					if (cchild.getNodeType() == 1) {
						NodeList valueNodeList = (NodeList) cchild.getChildNodes();
						for (int k = 0; k < valueNodeList.getLength(); k++) {
							Node value = valueNodeList.item(k);
							resMap.put(cchild.getNodeName(), value.getNodeValue());
						}
					}
				}
				resList.add(resMap);
			}
		} catch (ParserConfigurationException e) {
			e.printStackTrace();
		} catch (IOException ie) {
			ie.printStackTrace();
		} catch (SAXException saxe) {
			saxe.printStackTrace();
		} catch (XPathExpressionException xee) {
			xee.printStackTrace();
		}
		return resList;
	}

	public String readFile(String file) throws IOException {
//		BufferedReader reader = new BufferedReader(new FileReader(file));
		BufferedReader reader = new BufferedReader( new InputStreamReader(new FileInputStream(file), "UTF-8" ));
		
		String line = null;
		StringBuilder stringBuilder = new StringBuilder();
		String ls = System.getProperty("line.separator");

		try {
			while ((line = reader.readLine()) != null) {
				stringBuilder.append(line);
				stringBuilder.append(ls);
			}

			return stringBuilder.toString();
		} finally {
			reader.close();
		}
	}

	public String makeSoapRequest(String queryId, String fml_id , String target_gbn) {

		SimpleDateFormat f = new SimpleDateFormat("yyyyMMddHHmmssSSS");
		String msgkey = f.format(new Date()) + makeRandomNumber();

		StringBuilder sb = new StringBuilder();
		sb.append("<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"yes\"?>");
		sb.append("<env:Envelope xmlns:env=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:soapenc=\"http://schemas.xmlsoap.org/soap/encoding/\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\">");
		sb.append("<env:Header>");
		sb.append("</env:Header>");
		sb.append("<env:Body>");
		sb.append("<DOCUMENT>");
		sb.append("<IFID>SOINN00001</IFID>");
		sb.append("<SRCORGCD>4160000</SRCORGCD>");
		sb.append("<TGTORGCD>4160000</TGTORGCD>");
		sb.append("<RESULTCODE>000</RESULTCODE>");
		sb.append("<MSGKEY>" + msgkey + "</MSGKEY>");
		sb.append("<DATA>");
		sb.append("<message>");
		sb.append("<body>");
		sb.append("<query_id>" + queryId + "</query_id>");
		sb.append("<cndList>");
		// 신고 : AGCA, 허가 : AGCB, 협의 : AGCC
		sb.append("<cnd>" + "SUBSTR(apv_perm_reg_mgt_no,1,4) = '" + target_gbn + "'" + "</cnd>");
		sb.append("</cndList>");
		sb.append("<cndList>");
		sb.append("<cnd>" + "fml_id IN ('"+fml_id+"')" + "</cnd>");
		sb.append("</cndList>");
		sb.append("</body>");
		sb.append("</message>");
		sb.append("</DATA>");
		sb.append("</DOCUMENT>");
		sb.append("</env:Body>");
		sb.append("</env:Envelope>");
		return sb.toString();
	}

	public String makeSoapRequest(String queryId, String regn_code, String lg_gbn, String bo_jibn, String bu_jibn, String target_gbn) {

		SimpleDateFormat f = new SimpleDateFormat("yyyyMMddHHmmssSSS");
		String msgkey = f.format(new Date()) + makeRandomNumber();

		StringBuilder sb = new StringBuilder();
		sb.append("<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"yes\"?>");
		sb.append("<env:Envelope xmlns:env=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:soapenc=\"http://schemas.xmlsoap.org/soap/encoding/\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\">");
		sb.append("<env:Header>");
		sb.append("</env:Header>");
		sb.append("<env:Body>");
		sb.append("<DOCUMENT>");
		sb.append("<IFID>SOINN00001</IFID>");
		sb.append("<SRCORGCD>4160000</SRCORGCD>");
		sb.append("<TGTORGCD>4160000</TGTORGCD>");
		sb.append("<RESULTCODE>000</RESULTCODE>");
		sb.append("<MSGKEY>" + msgkey + "</MSGKEY>");
		sb.append("<DATA>");
		sb.append("<message>");
		sb.append("<body>");
		sb.append("<query_id>" + queryId + "</query_id>");
		sb.append("<cndList>");
		// 허가 : 17, 신고 : 18, 협의 : 19
		sb.append("<cnd>" + "SUBSTR(FOM_APV_NO,8,2) = '"+ target_gbn+ "'" + "</cnd>");
		sb.append("</cndList>");
		sb.append("<cndList>");
		sb.append("<cnd>" + "(REGN_CODE||LG_GBN||BO_JIBN||BU_JIBN) IN ('"+regn_code+lg_gbn+bo_jibn+bu_jibn+"')" + "</cnd>");
		sb.append("</cndList>");
		sb.append("</body>");
		sb.append("</message>");
		sb.append("</DATA>");
		sb.append("</DOCUMENT>");
		sb.append("</env:Body>");
		sb.append("</env:Envelope>");
		return sb.toString();
	}

	private String makeRandomNumber() {
		long timeSeed = System.nanoTime(); // to get the current date time value
		double randSeed = Math.random() * 1000; // random number generation
		long midSeed = (long) (timeSeed * randSeed); // mixing up the time and

		String s = midSeed + "";
		String subStr = s.substring(0, 8);
		return subStr;
	}
}
