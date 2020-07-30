package am.common.web.service.impl;

import java.util.List;

import javax.annotation.Resource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import am.common.web.StdCodeController;
import am.common.web.service.StdCodeService;

@Service("stdCodeService")
public class StdCodeServiceImpl implements StdCodeService 
{
	private static final Logger logger = LoggerFactory.getLogger(StdCodeServiceImpl.class);
	
	@Resource(name="stdCodeMapper")
	StdCodeMapper stdCodeMapper;
	
	// 표준코드 리스트 조회
	@Override
	public List<?> selectStdCodeList(String stdGrp) throws Exception 
	{
		return this.stdCodeMapper.selectStdCodeList(stdGrp);
	}
	
}
