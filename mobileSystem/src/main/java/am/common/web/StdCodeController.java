package am.common.web;

import java.util.List;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import am.common.annotation.AuthExclude;
import am.common.web.service.StdCodeService;

@Controller
public class StdCodeController {

	private static final Logger logger = LoggerFactory.getLogger(StdCodeController.class);
	
	@Resource(name = "stdCodeService")
	private StdCodeService stdCodeService;
	
	// 표준코드 리스트 조회
	@AuthExclude
	@RequestMapping(value = "/common/selectStdCodeList.do")
	public String loginChecking(@RequestParam(value="stdGrp", required=true) String stdGrp, ModelMap model, HttpServletRequest request) throws Exception 
	{
		List<?> stdCodeList = this.stdCodeService.selectStdCodeList(stdGrp);
		model.addAttribute("rList", stdCodeList);
		
		return "json2View";
	}
}
