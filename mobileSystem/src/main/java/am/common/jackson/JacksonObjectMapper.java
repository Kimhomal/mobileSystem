package am.common.jackson;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.DefaultSerializerProvider;

public class JacksonObjectMapper extends ObjectMapper{

	private static final long serialVersionUID = 1L;

	public JacksonObjectMapper(){
		SerializerProvider sp = this.getSerializerProvider();
		sp.setNullValueSerializer(new JacksonNullSerializer());
		this.setSerializerProvider((DefaultSerializerProvider) sp);
	}
}