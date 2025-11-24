package com.campus.market.common.exception;

import com.campus.market.common.api.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<?>> handleBusiness(BusinessException ex) {
        return new ResponseEntity<>(ApiResponse.fail(ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFound(EntityNotFoundException ex) {
        return new ResponseEntity<>(ApiResponse.fail("资源不存在"), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getField() + " " + err.getDefaultMessage())
                .orElse("参数校验失败");
        return new ResponseEntity<>(ApiResponse.fail(msg), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleOther(Exception ex) {
        ex.printStackTrace();
        // 调试阶段返回具体错误信息，生产环境应改为"服务器内部错误"
        return new ResponseEntity<>(ApiResponse.fail("服务器内部错误: " + ex.toString()), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
