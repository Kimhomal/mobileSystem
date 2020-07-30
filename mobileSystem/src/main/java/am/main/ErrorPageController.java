package am.main;

import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ErrorPageController {

//	@AuthExclude
	@RequestMapping("/error/error-{errorCode}.do")
	public String handlePageNotFound(@PathVariable("errorCode") String errorCode, HttpServletRequest request, ModelMap model) {

		model.addAttribute("errorCode", errorCode);
		return "error/error";

	}
}