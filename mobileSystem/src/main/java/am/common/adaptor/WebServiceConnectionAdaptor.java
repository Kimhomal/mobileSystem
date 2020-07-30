package am.common.adaptor;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.util.Assert;

public class WebServiceConnectionAdaptor implements InitializingBean, DisposableBean 
{
	private static final Logger logger = LoggerFactory.getLogger(WebServiceConnectionAdaptor.class);

	/** 기본 {@link #connectionTimeout} */
	public static final int DEFAULT_CONNECTION_TIMEOUT = 60000;

	/** 기본 {@link #readTimeout} */
	public static final int DEFAULT_READ_TIMEOUT = 60000;

	private String hostName;
	private String requestMethod;
	private String soapAction;
	private String contentType;
	private String encoding;
	private int connectionTimeOut = DEFAULT_CONNECTION_TIMEOUT;
	private int readTimeOut = DEFAULT_READ_TIMEOUT;

	public String getHostName() {
		return hostName;
	}

	public void setHostName(String hostName) {
		this.hostName = hostName;
	}

	public String getRequestMethod() {
		return requestMethod;
	}

	public void setRequestMethod(String requestMethod) {
		this.requestMethod = requestMethod;
	}

	public String getSoapAction() {
		return soapAction;
	}

	public void setSoapAction(String soapAction) {
		this.soapAction = soapAction;
	}

	public String getContentType() {
		return contentType;
	}

	public void setContentType(String contentType) {
		this.contentType = contentType;
	}

	public String getEncoding() {
		return encoding;
	}

	public void setEncoding(String encoding) {
		this.encoding = encoding;
	}

	public int getConnectionTimeOut() {
		return connectionTimeOut;
	}

	public void setConnectionTimeOut(int connectionTimeOut) {
		this.connectionTimeOut = connectionTimeOut;
	}

	public int getReadTimeOut() {
		return readTimeOut;
	}

	public void setReadTimeOut(int readTimeOut) {
		this.readTimeOut = readTimeOut;
	}	

	public static int getDefaultConnectionTimeout() {
		return DEFAULT_CONNECTION_TIMEOUT;
	}

	public static int getDefaultReadTimeout() {
		return DEFAULT_READ_TIMEOUT;
	}

	public WebServiceConnectionAdaptor() {

	}

	public String call(String soapMessage) throws Exception 
	{
		String responseMessage = null;
		OutputStreamWriter osw = null;
		BufferedReader br = null;
		InputStream is = null;		
		URL url = null;
		HttpURLConnection urlConnection;

		if(this.requestMethod.toUpperCase().equals("GET")){
			url = new URL(this.hostName + soapMessage);
		} else if (this.requestMethod.toUpperCase().equals("POST")){
			url = new URL(this.hostName);
		}
		
		// 요청 호스트에 연결
		urlConnection = (HttpURLConnection) url.openConnection();
		// 요청 응답 타임아웃 설정
		urlConnection.setConnectTimeout(this.connectionTimeOut);
		// 읽기 타임아웃 설정
		urlConnection.setReadTimeout(this.readTimeOut);
		// 전송 방식 (POST, GET)
		urlConnection.setRequestMethod(this.requestMethod.toUpperCase());

		urlConnection.setRequestProperty("Content-Type", this.contentType);
		urlConnection.setRequestProperty("Content-Length", Integer.toString(soapMessage.getBytes().length));
		urlConnection.setRequestProperty("SOAPAction", this.soapAction);

		// 요청편집허가
		urlConnection.setDoInput(true); // 서버에서 읽기 모드 지정
		// 캐쉬설정 (꺼두었음)
		urlConnection.setUseCaches(false);

		if(this.requestMethod.toUpperCase().equals("GET")){
			urlConnection.setDoOutput(false); // 서버로 쓰기 모드 지정
		} else if (this.requestMethod.toUpperCase().equals("POST")){
			urlConnection.setDoOutput(true); // 서버로 쓰기 모드 지정
			osw = new OutputStreamWriter(urlConnection.getOutputStream());
			osw.write(soapMessage); // 스트림에 데이터쓰기
			osw.flush(); // 스트림의 데이터 목적지로 분출하기
		}

//		logger.info("Request Message :: {}", url);
//		logger.info("Request Message :: {}", soapMessage.getBytes().length);
//		logger.info("Request Message :: {}", soapMessage);

		try 
		{
			// 스트림형태의 데이타 받기 (Response SOAP Message)
			is = urlConnection.getInputStream();
			// 스트림데이타를 읽기 위하여 버퍼에 저장 
			br = new BufferedReader(new InputStreamReader(is, this.encoding));
			
		} catch (Exception e) {

			e.printStackTrace();
//			logger.error("", e);
			br = new BufferedReader(new InputStreamReader(urlConnection.getErrorStream(), "UTF-8"));

		} finally {

			StringBuffer buffer = new StringBuffer();
			String inputLine;

			while ((inputLine = br.readLine()) != null) {
				buffer.append(inputLine).append("\r\n");
			}

//			logger.info("response : {}", buffer.toString());
			responseMessage = buffer.toString();

			if (br != null) br.close();
			if (osw != null) osw.close();
			if (urlConnection != null) urlConnection.disconnect();
		}

		return responseMessage;
	}

	@Override
	public void destroy() throws Exception 
	{
		// TODO Auto-generated method stub
	}

	/**
	 * Bean LifeCycle 중 초기화 메소드 <br>
	 * 빈 객체의 프로퍼티가 올바르게 설정되었는지 여부를 검사하는 용도<br>
	 * 
	 * @exception property  셋팅 미완료 시
	 */
	@Override
	public void afterPropertiesSet() throws Exception {
		Assert.notNull(hostName, "Bean Property 'Host Name' must not be null.");
		Assert.notNull(requestMethod, "Bean Property 'Request Method' must not be null.");
		Assert.notNull(soapAction, "Bean Property 'Soap Action' must not be null.");
		Assert.notNull(contentType, "Bean Property 'Content Type' must not be null.");
		Assert.notNull(encoding, "Bean Property 'encoding' must not be null.");
	}
}
