package am.map;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;
import java.nio.charset.CharsetDecoder;
import java.util.Map.Entry;

import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import am.common.annotation.AuthExclude;
import egovframework.com.cmm.service.EgovProperties;
import egovframework.com.json.JSONObject;

@Controller
public class ProxyController {

	private static final Logger LOGGER = LoggerFactory.getLogger(ProxyController.class);

	/**
	 * Get 방식 WMS 프록시
	 * @param request 요청 객체
	 * @param response 응답 객체
	 * @throws Exception
	 */
	@AuthExclude
	@RequestMapping(value="/map/proxy/wms.do", method=RequestMethod.GET)
	public void proxyWMSGet(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String urlStr = EgovProperties.getGISProperty("GeoServer.WMS");
		proxyGet(urlStr, request, response);
	}

	/**
	 * Post 방식 WMS 프록시
	 * @param request 요청 객체
	 * @param response 응답 객체
	 * @throws Exception
	 */
	@AuthExclude
	@RequestMapping(value="/map/proxy/wms.do", method=RequestMethod.POST)
	public void proxyWMSPost(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String urlStr = EgovProperties.getGISProperty("GeoServer.WMS");
		proxyPost(urlStr, request, response);
	}

	/**
	 * Get 방식 WFS 프록시
	 * @param request 요청 객체
	 * @param response 응답 객체
	 * @throws Exception
	 */
	@AuthExclude
	@RequestMapping(value="/map/proxy/wfs.do", method=RequestMethod.GET)
	public void proxyWFSGet(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String urlStr = EgovProperties.getGISProperty("GeoServer.WFS");
		proxyGet(urlStr, request, response);
	}

	/**
	 * Post 방식 WFS 프록시
	 * @param request 요청 객체
	 * @param response 응답 객체
	 * @throws Exception
	 */
	@AuthExclude
	@RequestMapping(value="/map/proxy/wfs.do", method=RequestMethod.POST)
	public void proxyWFSPost(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String urlStr = EgovProperties.getGISProperty("GeoServer.WFS");
		proxyPost(urlStr, request, response);
	}

	/**
	 * 배경지도 프록시
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@AuthExclude
	@RequestMapping(value="/map/proxy/proxyBackground.do")
	public void proxyBackground(HttpServletRequest request, HttpServletResponse response) throws Exception {

		String urlStr = request.getParameter("url");

		if (!"".equals(request.getParameter("URL"))) {
			urlStr += "&URL=" + request.getParameter("URL");
		}

		HttpURLConnection huc = null;
		OutputStream ios = null;

		try {
			request.setCharacterEncoding("UTF-8");

			URL url = new URL(urlStr);

			URLConnection connection = url.openConnection();
			huc = (HttpURLConnection)connection;
			huc.setDoOutput(true);

			response.reset();
			response.setContentType(huc.getContentType());

			ios = response.getOutputStream();
			IOUtils.copy(huc.getInputStream(), ios);
		} catch (IOException e) {

//			LOGGER.warn(e.getMessage());
			//throw e;
		} finally {
			if(ios != null) {
				ios.close();
			}
			if(huc != null) {
				huc.disconnect();
			}
		}
	}

	/**
	 * Get 방식 프록시
	 * @param urlStr 요청 주소
	 * @param request 요청 객체
	 * @param response 응답 객체
	 * @throws IOException
	 */
	@AuthExclude
	public void proxyGet(String urlStr, HttpServletRequest request, HttpServletResponse response) throws IOException {
		HttpURLConnection huc = null;
		OutputStream ios = null;

		try {
			request.setCharacterEncoding("UTF-8");
			StringBuffer params = new StringBuffer();
			for(Object param : request.getParameterMap().entrySet()) {
				@SuppressWarnings("unchecked")
				Entry<String, String[]> entry = (Entry<String, String[]>) param;

				if(entry.getKey().indexOf('=') >= 0) {
					params.append(getLocaleString(entry.getKey()));
				} else {
					params.append(entry.getKey());
					params.append("=");

					String[] values = entry.getValue();
					if(values.length > 0) {
//						@SuppressWarnings("unchecked")
//						String flag = (String)((HashMap<String, Object>) request.getSession().getAttribute("ctkInfo")).get("temp");
//
//						if(("true".equals(flag) && entry.getKey().indexOf("LAYERS") >= 0) || ("true".equals(flag) && entry.getKey().indexOf("typename") >= 0)){
//							String layerName = request.getCharacterEncoding() == null ? URLEncoder.encode(getLocaleString(values[0]), "UTF-8") : URLEncoder.encode(values[0], "UTF-8");
//							layerName += "_temp";
//
//							params.append(layerName);
//						} else {
//							String layerName = request.getCharacterEncoding() == null ? URLEncoder.encode(getLocaleString(values[0]), "UTF-8") : URLEncoder.encode(values[0], "UTF-8");
//							params.append(layerName);
//						}

						String layerName = request.getCharacterEncoding() == null ? URLEncoder.encode(getLocaleString(values[0]), "UTF-8") : URLEncoder.encode(values[0], "UTF-8");
						params.append(layerName);
					}
					params.append("&");
				}
			}

			if(params.length() > 0 && params.substring(params.length()-1).equals("&")){
				params.deleteCharAt(params.length()-1);
			}

			URL url = new URL(urlStr.concat("?")+params);

			URLConnection connection = url.openConnection();
			huc = (HttpURLConnection)connection;
			huc.setRequestMethod("GET");
			huc.setDoOutput(true);
			huc.setDoInput(true);
			huc.setUseCaches(false);
			huc.setDefaultUseCaches(false);

			response.reset();
			response.setContentType(huc.getContentType());

			ios = response.getOutputStream();
			IOUtils.copy(huc.getInputStream(), ios);
		} catch (IOException e) {

			LOGGER.warn(e.getMessage());
			//throw e;
		} finally {
			if(ios != null) {
				ios.close();
			}
			if(huc != null) {
				huc.disconnect();
			}
		}


	}

	/**
	 * Post 방식 프록시
	 * @param urlStr 요청 주소
	 * @param request 요청 객체
	 * @param response 응답 객체
	 * @throws IOException
	 */
	@AuthExclude
	public void proxyPost(String urlStr, HttpServletRequest request, HttpServletResponse response) throws IOException {
		HttpURLConnection huc = null;
		OutputStream ios = null;

		URL url;

		try {
			url = new URL(urlStr+"?");
			URLConnection connection = url.openConnection();
			huc = (HttpURLConnection)connection;
			huc.setRequestMethod("POST");
			huc.setDoOutput(true);
			huc.setDoInput(true);
			huc.setUseCaches(false);
			huc.setDefaultUseCaches(false);
			huc.setRequestProperty("Content-Type", "text/xml;charset=utf-8");

			IOUtils.copy(request.getInputStream(), huc.getOutputStream());

			response.reset();
			response.setContentType(huc.getContentType());

			ios = response.getOutputStream();

			IOUtils.copy(huc.getInputStream(), ios);
		} catch (IOException e) {
			LOGGER.warn(e.getMessage());
			//throw e;
		} finally {
			if(ios != null) {
				ios.close();
			}
			if(huc != null) {
				huc.disconnect();
			}
		}
	}

	/**
	 * 한글 값 처리
	 * @param value 인코딩할 문자열
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	@AuthExclude
	private String getLocaleString(String value) throws UnsupportedEncodingException {
		byte[] b;
		b = value.getBytes("8859_1");
		final CharsetDecoder decoder = Charset.forName("UTF-8").newDecoder();
		try {
			final CharBuffer r = decoder.decode(ByteBuffer.wrap(b));
			return r.toString();
		} catch (final CharacterCodingException e) {
			return new String(b, "EUC-KR");
		}
	}
	
	/**
	 * 지도서비스 > 지도 이미지 Base64로 Convert
	 * @param model
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@RequestMapping(value = "/map/TileImageConvert")
	public void TileImageConvert(ModelMap model ,HttpServletRequest request, HttpServletResponse response) throws Exception {

		JSONObject jsonObject = new JSONObject();

		String URL = request.getParameter("url");

		URL url = new URL(URL);

		BufferedImage bfImage = ImageIO.read(url);

		ByteArrayOutputStream bos = new ByteArrayOutputStream();

		ImageIO.write(bfImage, "png", bos);

		byte[] imageBytes = bos.toByteArray();

		String imageString = Base64.encodeBase64String(imageBytes);

		String changeString = "data:image/png;base64, " + imageString;

		jsonObject.put("src", changeString);
		response.setCharacterEncoding("utf-8");
		response.setContentType("text/plain"); // ie 9에서 application/json 으로 하면 json이 다운로드 되는 현상 발생
		response.getWriter().println(jsonObject); // 그래서 text/plain 으로 함.
	}
}
