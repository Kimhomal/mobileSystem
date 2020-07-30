package am.common.adaptor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.web.context.ConfigurableWebApplicationContext;

public class WebApplicationContextSupport {
	
	@Autowired
	ConfigurableWebApplicationContext webCtx;

	public String getActivProfile()
	{
		ConfigurableEnvironment env = (ConfigurableEnvironment) webCtx.getEnvironment();
		
		String[] getProfiles = env.getActiveProfiles();
		
		return getProfiles[0];
		
	}
}
