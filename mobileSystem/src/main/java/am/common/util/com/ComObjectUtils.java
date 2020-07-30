package am.common.util.com;

import java.lang.reflect.Field;
import java.util.HashMap;

public class ComObjectUtils {

	/**
	 * VO 객체를 Map으로 변환
	 *
	 * @param vo
	 * @return
	 * @throws IllegalArgumentException
	 * @throws IllegalAccessException
	 */
	public static HashMap<String, Object> ObjectToMap(Object vo) throws IllegalArgumentException, IllegalAccessException {
		Field[] fields = vo.getClass().getDeclaredFields();
		HashMap<String, Object> map = new HashMap<String, Object>();
		for (int i = 0; i <= fields.length - 1; i++) {
			fields[i].setAccessible(true);
			map.put(fields[i].getName(), fields[i].get(vo));
		}

		return map;
	}
}
