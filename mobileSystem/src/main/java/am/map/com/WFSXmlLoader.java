package am.map.com;

import java.io.StringReader;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.ErrorHandler;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.SAXParseException;

public class WFSXmlLoader implements ErrorHandler {

	private String xmlStr;
	private Document doc;

	public String getXmlStr() {
		return xmlStr;
	}

	public void setXmlStr(String xmlStr) {
		this.xmlStr = xmlStr;
	}

	/**
	 * url 주소로 xml dom을 불러옴
	 *
	 * @param xmlStr
	 */
	public void setDocument(String xmlStr, String type) {
		try {
			this.setXmlStr(xmlStr);
			DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
			factory.setValidating(true);
			DocumentBuilder parser = factory.newDocumentBuilder();
			parser.setErrorHandler(null);
			type = type.toUpperCase();
			if (type.equals("URL")) {
				doc = parser.parse(xmlStr);
			} else if (type.equals("VALUE")) {
				doc = parser.parse(new InputSource(new StringReader(xmlStr)));
			} else {
				doc = parser.parse(new InputSource(new StringReader(xmlStr)));
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public NodeList getNodes() {
		return doc.getChildNodes();
	}

	public NodeList getNodeByTagName(String tagName) {
		try {
			return doc.getElementsByTagName(tagName);
		} catch (Exception e) {
			return null;
		}
	}

	public NodeList getFirstNodeByTagName(String tagName) {
		try {
			return getNodeByTagName(tagName).item(0).getChildNodes();
		} catch (Exception e) {
			return null;
		}

	}

	public NodeList getChildNodes(NodeList nl, int idx) {
		return nl.item(idx).getChildNodes();
	}

	public NodeList getFirstNodeChildNodes(NodeList nl) {
		return nl.item(0).getChildNodes();
	}

	public Node getChild(NodeList nl, String name) {
		for (int i = 0; i < nl.getLength(); i++)
			if (nl.item(i).getNodeName() == name)
				return nl.item(i);
		return null;
	}

	public String getValue(NodeList nl, String name) {
		for (int i = 0; i < nl.getLength(); i++)
			if (nl.item(i).getNodeName() == name)
				return nl.item(i).getNodeValue();
		return null;
	}

	public String getContent(NodeList nl, String name) {
		for (int i = 0; i < nl.getLength(); i++)
			if (nl.item(i).getNodeName() == name)
				return (nl.item(i)).getTextContent();
		return null;
	}

	@Override
	public void error(SAXParseException exception) throws SAXException {
		// TODO Auto-generated method stub
	}

	@Override
	public void fatalError(SAXParseException exception) throws SAXException {
		// TODO Auto-generated method stub
	}

	@Override
	public void warning(SAXParseException exception) throws SAXException {
		// TODO Auto-generated method stub
	}

}
