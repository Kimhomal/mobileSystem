package am.common.web;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import am.common.annotation.AuthExclude;
import am.main.service.impl.AuthVO;

public class AuthInterceptor implements HandlerInterceptor
{
	private static final Logger logger = LoggerFactory.getLogger(AuthInterceptor.class);
	
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws ServletException 
    {
    	String ctxPath = request.getContextPath();
		String uri = request.getRequestURI();
		StringBuffer url = request.getRequestURL();
		
		HandlerMethod handlerMethod = (HandlerMethod) handler;
		AuthExclude authExclude = handlerMethod.getMethodAnnotation(AuthExclude.class);
		authExclude = (authExclude == null) ? handlerMethod.getBeanType().getAnnotation(AuthExclude.class) : authExclude;
        
        // @AuthExclude 어노테이션이 없으면. 
        if(authExclude == null)
        {
        	try
    		{
        		String returnURI = ctxPath + "/mainPage.do";
//        		AuthVO authInfo = (AuthVO)request.getSession(false).getAttribute("authInfo");
        		AuthVO authInfo = (AuthVO)request.getSession().getAttribute("authInfo");
    			
    			// 세션이 존재 하지 않으면 로그인 체크
    			if(authInfo == null)
    			{
    				// AJAX 호출 (Jquery 등 대중성 있는 라이브러리들은 header 에 자동으로 추가하여 보냄)
    				if("XMLHttpRequest".equals(request.getHeader("x-requested-with")))
    				{
    					response.sendError(600, "세션이 만료되었습니다.");
    				}
    				else
    				{
//    					response.sendError(600, "세션이 만료되었습니다.");
    					response.sendRedirect(returnURI);
    				}
    				return false;
    			}
    			else
    			{

    			}
    		}
    		catch(NullPointerException e)
    		{
    			e.printStackTrace();
    			logger.error(e.getMessage());
    			return false;
    		} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }
        else 
        {

        }
        
        return true;
    }
    
    @Override
	public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception 
    {
	}

	/**
	 * This implementation is empty.
	 */
	@Override
	public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception 
	{
	}	
}
