package com.wmsweb.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.wmsweb.dto.PingResponse;

@Service
public class PingService {

    public PingResponse ping() {
        return new PingResponse("pong", LocalDateTime.now());
    }
}
