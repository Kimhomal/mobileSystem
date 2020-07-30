package egovframework.com.cmm;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import egovframework.rte.fdl.cmmn.exception.handler.ExceptionHandler;

public class EgovComOthersExcepHndlr implements ExceptionHandler {

	private static final Logger LOGGER = LoggerFactory.getLogger(EgovComOthersExcepHndlr.class);

    public void occur(Exception exception, String packageName) {
    	//log.debug(" EgovServiceExceptionHandler run...............");

		if (LOGGER.isDebugEnabled()) {
			LOGGER.error(packageName, exception);
		} else {
			LOGGER.error(packageName);
		}
    }
}
