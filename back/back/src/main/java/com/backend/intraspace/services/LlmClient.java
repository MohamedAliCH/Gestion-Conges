package com.backend.intraspace.services;

import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

public interface LlmClient {

    /** Synchronous completion — blocks until the full response is returned. */
    String complete(List<Map<String, String>> messages);

    /** Streaming completion — calls tokenConsumer for each token, blocks until done. */
    void streamComplete(List<Map<String, String>> messages, Consumer<String> tokenConsumer);
}
