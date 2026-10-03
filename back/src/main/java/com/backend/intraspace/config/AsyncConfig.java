package com.backend.intraspace.config;

import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
@EnableMethodSecurity
@Slf4j
public class AsyncConfig implements AsyncConfigurer {

    @Bean(name = "ragExecutor")
    public Executor ragExecutor() {
        return buildExecutor(2, 4, 50, "rag-pipeline-");
    }

    @Bean(name = "emailExecutor")
    public Executor emailExecutor() {
        return buildExecutor(1, 3, 100, "email-");
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (throwable, method, params) ->
                log.error("Async exception in method '{}': {}", method.getName(), throwable.getMessage(), throwable);
    }

    private Executor buildExecutor(int coreSize, int maxSize, int queueCapacity, String threadPrefix) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(coreSize);
        executor.setMaxPoolSize(maxSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix(threadPrefix);
        executor.initialize();
        return executor;
    }
}
