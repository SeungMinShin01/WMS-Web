package com.wmsweb.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wmsweb.dto.PingResponse;
import com.wmsweb.service.PingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PingController {

    private final PingService pingService;

    @GetMapping("/ping")
    public PingResponse ping() {
        return pingService.ping();
    }
}
