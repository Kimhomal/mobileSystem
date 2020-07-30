package am.common.web.service.impl;

import java.util.List;

import egovframework.rte.psl.dataaccess.mapper.Mapper;

@Mapper("stdCodeMapper")
public interface StdCodeMapper 
{
	List<?> selectStdCodeList(String stdGrp) throws Exception;
}
