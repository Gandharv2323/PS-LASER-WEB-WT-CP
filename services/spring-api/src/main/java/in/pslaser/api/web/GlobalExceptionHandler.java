package in.pslaser.api.web;

import in.pslaser.api.dto.ApiError;
import jakarta.validation.ConstraintViolationException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * One place that converts every exception into the CONTRACT error format
 * {@code { "status", "error", "message", "fieldErrors"? }}.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(ApiException.class)
	ResponseEntity<ApiError> handleApi(ApiException ex) {
		return build(ex.getStatus(), ex.getMessage(), null);
	}

	/** Bean Validation failures on @Valid @RequestBody DTOs -> 400 with per-field messages. */
	@ExceptionHandler(MethodArgumentNotValidException.class)
	ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
		Map<String, String> fields = new LinkedHashMap<>();
		ex.getBindingResult().getFieldErrors().forEach(fe -> fields.putIfAbsent(fe.getField(), fe.getDefaultMessage()));
		return build(HttpStatus.BAD_REQUEST, "Validation failed", fields);
	}

	@ExceptionHandler(ConstraintViolationException.class)
	ResponseEntity<ApiError> handleConstraint(ConstraintViolationException ex) {
		Map<String, String> fields = new LinkedHashMap<>();
		ex.getConstraintViolations().forEach(v -> fields.putIfAbsent(v.getPropertyPath().toString(), v.getMessage()));
		return build(HttpStatus.BAD_REQUEST, "Validation failed", fields);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException ex) {
		return build(HttpStatus.BAD_REQUEST, "Malformed JSON request body", null);
	}

	@ExceptionHandler({ MissingServletRequestParameterException.class, MethodArgumentTypeMismatchException.class })
	ResponseEntity<ApiError> handleParams(Exception ex) {
		return build(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
	}

	@ExceptionHandler(HttpRequestMethodNotSupportedException.class)
	ResponseEntity<ApiError> handleMethod(HttpRequestMethodNotSupportedException ex) {
		return build(HttpStatus.METHOD_NOT_ALLOWED, ex.getMessage(), null);
	}

	@ExceptionHandler(NoResourceFoundException.class)
	ResponseEntity<ApiError> handleNoResource(NoResourceFoundException ex) {
		return build(HttpStatus.NOT_FOUND, "No endpoint " + ex.getResourcePath(), null);
	}

	/** @PreAuthorize denials raised inside controllers/services. */
	@ExceptionHandler({ AccessDeniedException.class, AuthorizationDeniedException.class })
	ResponseEntity<ApiError> handleDenied(Exception ex) {
		return build(HttpStatus.FORBIDDEN, "You do not have permission for this action", null);
	}

	@ExceptionHandler(Exception.class)
	ResponseEntity<ApiError> handleOther(Exception ex) {
		log.error("Unhandled error", ex);
		return build(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected server error", null);
	}

	private ResponseEntity<ApiError> build(HttpStatus status, String message, Map<String, String> fields) {
		return ResponseEntity.status(status)
				.body(new ApiError(status.value(), status.getReasonPhrase(), message, fields));
	}
}
