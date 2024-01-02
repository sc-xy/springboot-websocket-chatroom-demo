package top.scxy.springbootwebsocketchatroomdemo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * &#064;EnableWebSocketMessageBroker  注解用于开启使用 STOMP 协议来传输基于代理（message broker）的消息，
 * 这时候控制器（controller）开始支持@MessageMapping, 就像是使用 @RequestMapping 一样。
 */

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry){
        // 注册一个 Stomp 的节点（endpoint）,并指定使用 SockJS 协议。
        registry.addEndpoint("/ws").withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 配置消息代理（Message Broker）
        // 广播式应配置一个 /topic 消息代理，点对点式应增加一个 /user 消息代理。
        registry.enableSimpleBroker("/topic", "/user");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
