package am.map.com;

import java.io.ByteArrayOutputStream;
import java.io.UnsupportedEncodingException;
import java.util.StringTokenizer;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

public class WFSXmlCreator {

	private static final Logger logger = LoggerFactory.getLogger(WFSXmlCreator.class);

	private String xmlStr;

	public String getXmlStr() {
		return xmlStr;
	}

	public void setXmlStr(String xmlStr) {
		this.xmlStr = xmlStr;
	}

	public String getIntersectsFromPoint(String layerList, String value, String srsName) throws ParserConfigurationException, TransformerException, UnsupportedEncodingException {
		value = value.replaceAll(",", " ");
		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		DocumentBuilder builder = factory.newDocumentBuilder();
		Document doc = builder.newDocument();
		Element root = doc.createElement("wfs:GetFeature");
		root.setAttribute("xmlns:wfs", "http://www.opengis.net/wfs");
		root.setAttribute("xmlns:ogc", "http://www.opengis.net/ogc");
		root.setAttribute("xmlns:gml", "http://www.opengis.net/gml");
		root.setAttribute("xmlns:cgf", "http://www.opengis.net/cite/geometry");
		root.setAttribute("OUTPUTFORMAT", "text/xml");
		root.setAttribute("version", "1.1.0");
		root.setAttribute("service", "WFS");
		doc.appendChild(root);
		StringTokenizer st = new StringTokenizer(layerList, ",");
		while (st.hasMoreElements()) {
			String layer = st.nextToken();
			Element query = doc.createElement("wfs:Query");
			query.setAttribute("typeName", layer);
			query.setAttribute("srsName", srsName);
			root.appendChild(query);
			Element filter = doc.createElement("ogc:Filter");
			query.appendChild(filter);
			Element fType = doc.createElement("ogc:Intersects");
			Element fCond1 = doc.createElement("ogc:PropertyName");
			fCond1.setTextContent("Shape");
			Element fCond2 = doc.createElement("gml:Envelope");
			fCond2.setAttribute("srsName", srsName);
			Element fCond2Val1 = doc.createElement("gml:lowerCorner");
			fCond2Val1.setTextContent(value);
			Element fCond2Val2 = doc.createElement("gml:upperCorner");
			fCond2Val2.setTextContent(value);
			fCond2.appendChild(fCond2Val1);
			fCond2.appendChild(fCond2Val2);
			fType.appendChild(fCond1);
			fType.appendChild(fCond2);
			filter.appendChild(fType);
		}
		TransformerFactory tranFac = TransformerFactory.newInstance();
		Transformer trans = tranFac.newTransformer();
		trans.setOutputProperty(OutputKeys.METHOD, "xml");
		trans.setOutputProperty(OutputKeys.INDENT, "yes");
		trans.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
		ByteArrayOutputStream bout = new ByteArrayOutputStream();
		StreamResult sr = new StreamResult(bout);
		DOMSource source = new DOMSource(doc);
		trans.transform(source, sr);

		xmlStr = bout.toString("UTF-8");
		return xmlStr;
	}

	public String getIntersectsFromPolygon(String layerList, String value, String srsName) throws ParserConfigurationException, TransformerException, UnsupportedEncodingException {
		try {
			value = value.replaceAll(",", " ");
			DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
			DocumentBuilder builder = factory.newDocumentBuilder();
			Document doc = builder.newDocument();
			Element root = doc.createElement("wfs:GetFeature");
			root.setAttribute("xmlns:wfs", "http://www.opengis.net/wfs");
			root.setAttribute("xmlns:ogc", "http://www.opengis.net/ogc");
			root.setAttribute("xmlns:gml", "http://www.opengis.net/gml");
			root.setAttribute("xmlns:cgf", "http://www.opengis.net/cite/geometry");
			root.setAttribute("OUTPUTFORMAT", "text/xml");
			root.setAttribute("version", "1.1.0");
			root.setAttribute("service", "WFS");
			doc.appendChild(root);
			StringTokenizer st = new StringTokenizer(layerList, ",");
			while (st.hasMoreElements()) {
				String layer = st.nextToken();
				Element query = doc.createElement("wfs:Query");
				query.setAttribute("typeName", layer);
				query.setAttribute("srsName", srsName);
				root.appendChild(query);
				Element filter = doc.createElement("ogc:Filter");
				query.appendChild(filter);
				Element fType = doc.createElement("ogc:Intersects");
				Element fCond1 = doc.createElement("ogc:PropertyName");
				fCond1.setTextContent("Shape");
				Element fCond2 = doc.createElement("gml:Polygon");
				fCond2.setAttribute("srsName", srsName);
				Element fCond3 = doc.createElement("gml:exterior");
				Element fCond4 = doc.createElement("gml:LinearRing");
				Element fCond5 = doc.createElement("gml:posList");
				fCond5.setTextContent(value);
				fCond4.appendChild(fCond5);
				fCond3.appendChild(fCond4);
				fCond2.appendChild(fCond3);
				fType.appendChild(fCond1);
				fType.appendChild(fCond2);
				filter.appendChild(fType);
			}
			TransformerFactory tranFac = TransformerFactory.newInstance();
			Transformer trans = tranFac.newTransformer();
			trans.setOutputProperty(OutputKeys.METHOD, "xml");
			trans.setOutputProperty(OutputKeys.INDENT, "yes");
			trans.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
			ByteArrayOutputStream bout = new ByteArrayOutputStream();
			StreamResult sr = new StreamResult(bout);
			DOMSource source = new DOMSource(doc);
			trans.transform(source, sr);

			xmlStr = bout.toString("UTF-8");
		} catch (NullPointerException e) {
			logger.debug(e.getMessage());
			return null;
		}
		return xmlStr;
	}

	public String getIntersectsFromPnu(String layer, String value, String srsName) throws Exception {
		try {
			DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
			DocumentBuilder builder = factory.newDocumentBuilder();
			Document doc = builder.newDocument();
			Element root = doc.createElement("wfs:GetFeature");
			root.setAttribute("xmlns:wfs", "http://www.opengis.net/wfs");
			root.setAttribute("xmlns:ogc", "http://www.opengis.net/ogc");
			root.setAttribute("xmlns:gml", "http://www.opengis.net/gml");
			root.setAttribute("xmlns:cgf", "http://www.opengis.net/cite/geometry");
			root.setAttribute("OUTPUTFORMAT", "text/xml");
			root.setAttribute("version", "1.1.0");
			root.setAttribute("service", "WFS");
			doc.appendChild(root);
			Element query = doc.createElement("wfs:Query");
			query.setAttribute("typeName", layer);
			query.setAttribute("srsName", srsName);
			root.appendChild(query);
			Element filter = doc.createElement("ogc:Filter");
			query.appendChild(filter);
			Element fType = doc.createElement("ogc:PropertyIsEqualTo");
			fType.setAttribute("srsName", srsName);
			Element fCond1 = doc.createElement("ogc:PropertyName");
			fCond1.setTextContent("PNU");
			Element fCond2 = doc.createElement("ogc:Literal");
			fCond2.setTextContent(value);
			fType.appendChild(fCond1);
			fType.appendChild(fCond2);
			filter.appendChild(fType);

			TransformerFactory tranFac = TransformerFactory.newInstance();
			Transformer trans = tranFac.newTransformer();
			trans.setOutputProperty(OutputKeys.METHOD, "xml");
			trans.setOutputProperty(OutputKeys.INDENT, "yes");
			trans.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
			ByteArrayOutputStream bout = new ByteArrayOutputStream();
			StreamResult sr = new StreamResult(bout);
			DOMSource source = new DOMSource(doc);
			trans.transform(source, sr);

			xmlStr = bout.toString("UTF-8");
		} catch (Exception e) {
			logger.debug(e.getMessage());
			return null;
		}
		return xmlStr;
	}

	public String getIntersectsFromLiteral(String typeName, String propertyName, String literals, String srsName) throws ParserConfigurationException, TransformerException,
			UnsupportedEncodingException {
		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		DocumentBuilder builder = factory.newDocumentBuilder();
		Document doc = builder.newDocument();
		Element root = doc.createElement("wfs:GetFeature");
		root.setAttribute("xmlns:wfs", "http://www.opengis.net/wfs");
		root.setAttribute("xmlns:ogc", "http://www.opengis.net/ogc");
		root.setAttribute("xmlns:gml", "http://www.opengis.net/gml");
		root.setAttribute("xmlns:cgf", "http://www.opengis.net/cite/geometry");
		root.setAttribute("OUTPUTFORMAT", "text/xml");
		root.setAttribute("version", "1.1.0");
		root.setAttribute("service", "WFS");
		doc.appendChild(root);
		Element query = doc.createElement("wfs:Query");
		query.setAttribute("typeName", typeName);
		query.setAttribute("srsName", srsName);
		root.appendChild(query);
		Element filter = doc.createElement("ogc:Filter");
		query.appendChild(filter);
		int length = literals.split(",").length;
		Element or = null;
		if (length > 1) {
			or = doc.createElement("ogc:Or");
			filter.appendChild(or);
		}
		StringTokenizer st = new StringTokenizer(literals, ",");
		while (st.hasMoreElements()) {
			String literal = st.nextToken();
			Element fType = doc.createElement("ogc:PropertyIsEqualTo");
			fType.setAttribute("srsName", srsName);
			Element fCond1 = doc.createElement("ogc:PropertyName");
			fCond1.setTextContent(propertyName);
			Element fCond2 = doc.createElement("ogc:Literal");
			fCond2.setTextContent(literal);
			fType.appendChild(fCond1);
			fType.appendChild(fCond2);
			if (length > 1) {
				or.appendChild(fType);
			} else {
				filter.appendChild(fType);
			}
		}
		TransformerFactory tranFac = TransformerFactory.newInstance();
		Transformer trans = tranFac.newTransformer();
		trans.setOutputProperty(OutputKeys.METHOD, "xml");
		trans.setOutputProperty(OutputKeys.INDENT, "yes");
		trans.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
		ByteArrayOutputStream bout = new ByteArrayOutputStream();
		StreamResult sr = new StreamResult(bout);
		DOMSource source = new DOMSource(doc);
		trans.transform(source, sr);

		xmlStr = bout.toString("UTF-8");
		return xmlStr;
	}
	
	public String getIntersectsFromLiterals(String typeName, String propertyName, String literals, String srsName) throws ParserConfigurationException, TransformerException,
	UnsupportedEncodingException {
		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		DocumentBuilder builder = factory.newDocumentBuilder();
		Document doc = builder.newDocument();
		Element root = doc.createElement("wfs:GetFeature");
		root.setAttribute("xmlns:wfs", "http://www.opengis.net/wfs");
		root.setAttribute("xmlns:ogc", "http://www.opengis.net/ogc");
		root.setAttribute("xmlns:gml", "http://www.opengis.net/gml");
		root.setAttribute("xmlns:cgf", "http://www.opengis.net/cite/geometry");
		root.setAttribute("OUTPUTFORMAT", "text/xml");
		root.setAttribute("version", "1.1.0");
		root.setAttribute("service", "WFS");
		doc.appendChild(root);
		Element query = doc.createElement("wfs:Query");
		query.setAttribute("typeName", typeName);
		query.setAttribute("srsName", srsName);
		root.appendChild(query);
		Element filter = doc.createElement("ogc:Filter");
		query.appendChild(filter);
		int length = literals.split(",").length;
		Element MainAnd = null;
		MainAnd = doc.createElement("ogc:Or");
		filter.appendChild(MainAnd);

//		StringTokenizer st = new StringTokenizer(literals, ",");
//		
//		while (st.hasMoreElements()) {
//			String literal = st.nextToken();
			String[] arryStr = literals.split(",");
			String[] arryCol = propertyName.split(",");
			Element SubAnd = doc.createElement("ogc:And");
			for (int i = 0; i < arryStr.length; i++) {
				Element fType = doc.createElement("ogc:PropertyIsEqualTo");
				fType.setAttribute("srsName", srsName);
				Element fCond1 = doc.createElement("ogc:PropertyName");
				fCond1.setTextContent(arryCol[i]);
				Element fCond2 = doc.createElement("ogc:Literal");
				fCond2.setTextContent(arryStr[i]);
				fType.appendChild(fCond1);
				fType.appendChild(fCond2);
				SubAnd.appendChild(fType);
			}

			MainAnd.appendChild(SubAnd);
//		}
		TransformerFactory tranFac = TransformerFactory.newInstance();
		Transformer trans = tranFac.newTransformer();
		trans.setOutputProperty(OutputKeys.METHOD, "xml");
		trans.setOutputProperty(OutputKeys.INDENT, "yes");
		trans.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
		ByteArrayOutputStream bout = new ByteArrayOutputStream();
		StreamResult sr = new StreamResult(bout);
		DOMSource source = new DOMSource(doc);
		trans.transform(source, sr);
		
		xmlStr = bout.toString("UTF-8");
		return xmlStr;
		}	

	public String getIntersectsFromPnuList(String layer, String value, String srsName) throws Exception {
		try {
			DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
			DocumentBuilder builder = factory.newDocumentBuilder();
			Document doc = builder.newDocument();
			Element root = doc.createElement("wfs:GetFeature");
			root.setAttribute("xmlns:wfs", "http://www.opengis.net/wfs");
			root.setAttribute("xmlns:ogc", "http://www.opengis.net/ogc");
			root.setAttribute("xmlns:gml", "http://www.opengis.net/gml");
			root.setAttribute("xmlns:cgf", "http://www.opengis.net/cite/geometry");
			root.setAttribute("OUTPUTFORMAT", "text/xml");
			root.setAttribute("version", "1.1.0");
			root.setAttribute("service", "WFS");
			doc.appendChild(root);
			Element query = doc.createElement("wfs:Query");
			query.setAttribute("typeName", layer);
			query.setAttribute("srsName", srsName);
			root.appendChild(query);
			Element filter = doc.createElement("ogc:Filter");
			query.appendChild(filter);
			int length = value.split(",").length;
			Element or = null;
			if (length > 1) {
				or = doc.createElement("ogc:Or");
				filter.appendChild(or);
			}
			StringTokenizer st = new StringTokenizer(value, ",");
			while (st.hasMoreElements()) {
				String pnu = st.nextToken();
				Element fType = doc.createElement("ogc:PropertyIsEqualTo");
				fType.setAttribute("srsName", srsName);
				Element fCond1 = doc.createElement("ogc:PropertyName");
				fCond1.setTextContent("PNU");
				Element fCond2 = doc.createElement("ogc:Literal");
				fCond2.setTextContent(pnu);
				fType.appendChild(fCond1);
				fType.appendChild(fCond2);
				if (length > 1) {
					or.appendChild(fType);
				} else {
					filter.appendChild(fType);
				}
			}
			TransformerFactory tranFac = TransformerFactory.newInstance();
			Transformer trans = tranFac.newTransformer();
			trans.setOutputProperty(OutputKeys.METHOD, "xml");
			trans.setOutputProperty(OutputKeys.INDENT, "yes");
			trans.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
			ByteArrayOutputStream bout = new ByteArrayOutputStream();
			StreamResult sr = new StreamResult(bout);
			DOMSource source = new DOMSource(doc);
			trans.transform(source, sr);

			xmlStr = bout.toString("UTF-8");
		} catch (Exception e) {
			logger.debug(e.getMessage());
			return null;
		}
		return xmlStr;
	}

	public String getIntersectsFromIndex(String layer, String value, String srsName) throws Exception {
		try {
			DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
			DocumentBuilder builder = factory.newDocumentBuilder();
			Document doc = builder.newDocument();
			Element root = doc.createElement("wfs:GetFeature");
			root.setAttribute("xmlns:wfs", "http://www.opengis.net/wfs");
			root.setAttribute("xmlns:ogc", "http://www.opengis.net/ogc");
			root.setAttribute("xmlns:gml", "http://www.opengis.net/gml");
			root.setAttribute("xmlns:cgf", "http://www.opengis.net/cite/geometry");
			root.setAttribute("OUTPUTFORMAT", "text/xml");
			root.setAttribute("version", "1.1.0");
			root.setAttribute("service", "WFS");
			doc.appendChild(root);
			Element query = doc.createElement("wfs:Query");
			query.setAttribute("typeName", layer);
			query.setAttribute("srsName", srsName);
			root.appendChild(query);
			Element filter = doc.createElement("ogc:Filter");
			query.appendChild(filter);
			Element fType = doc.createElement("ogc:PropertyIsEqualTo");
			fType.setAttribute("srsName", srsName);
			Element fCond1 = doc.createElement("ogc:PropertyName");
			fCond1.setTextContent("MAP_NUM");
			Element fCond2 = doc.createElement("ogc:Literal");
			fCond2.setTextContent(value);
			fType.appendChild(fCond1);
			fType.appendChild(fCond2);
			filter.appendChild(fType);

			TransformerFactory tranFac = TransformerFactory.newInstance();
			Transformer trans = tranFac.newTransformer();
			trans.setOutputProperty(OutputKeys.METHOD, "xml");
			trans.setOutputProperty(OutputKeys.INDENT, "yes");
			trans.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
			ByteArrayOutputStream bout = new ByteArrayOutputStream();
			StreamResult sr = new StreamResult(bout);
			DOMSource source = new DOMSource(doc);
			trans.transform(source, sr);

			xmlStr = bout.toString("UTF-8");
		} catch (Exception e) {
			logger.debug(e.getMessage());
			return null;
		}
		return xmlStr;
	}
}
