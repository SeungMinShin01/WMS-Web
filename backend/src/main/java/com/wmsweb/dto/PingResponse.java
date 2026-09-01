package com.wmsweb.dto;

import java.time.LocalDateTime;

public record PingResponse(String message, LocalDateTime respondedAt) {
}
