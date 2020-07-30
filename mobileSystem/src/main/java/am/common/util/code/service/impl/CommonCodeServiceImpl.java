package am.common.util.code.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.springframework.stereotype.Service;
import org.springframework.util.MethodInvoker;
import org.springframework.util.StringUtils;

import am.common.util.code.service.CommonCodeMapper;
import am.common.util.code.service.CommonCodeService;

@Service("commonCodeService")
public class CommonCodeServiceImpl implements CommonCodeService {

	@Resource(name = "commonCodeMapper")
	private CommonCodeMapper commonCodeMapper;

	@SuppressWarnings("unchecked")
	@Override
	public List<HashMap<String, String>> getCodeList(Map<String, Object> params) throws Exception {

		String codeGroup = ((String) params.get("codegroup"));

		List<HashMap<String, String>> result = new ArrayList<HashMap<String, String>>();

		String methodName = "get" + StringUtils.capitalize(codeGroup);

		try {
			MethodInvoker invoker = new MethodInvoker();
			invoker.setTargetObject(commonCodeMapper);
			invoker.setTargetMethod(methodName);
			invoker.setArguments(new Object[]{params});
			invoker.prepare();
			result = (List<HashMap<String, String>>) invoker.invoke();

		} catch (NoSuchMethodException ex) {
			//throw new Exception( "Method '" + methodName + "' not found", ex);
			result = new ArrayList<HashMap<String, String>>();
		}

		return result;
	}

	@Override
	public List<?> getExcel(HashMap<String, Object> param) throws Exception {
		return commonCodeMapper.getExcel(param);
	}
}
