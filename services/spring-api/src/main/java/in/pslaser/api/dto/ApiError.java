package in.pslaser.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;

/** CONTRACT error body: { "status", "error", "message", "fieldErrors"?: {field: msg} }. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(int status, String error, String message, Map<String, String> fieldErrors) {

	public static ApiError of(int status, String error, String message) {
		return new ApiError(status, error, message, null);
	}
}
