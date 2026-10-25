package com.example.demo;

import java.util.List;
import java.util.Map;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins="http://localhost:5173")
@RestController
@RequestMapping("/api/chat")
public class ChatController
{
	
    private final ChatClient chatClient;
	private final ChatMessageRepository repository;
	
	public ChatController(ChatMessageRepository repository, ChatClient.Builder chatClientBuilder)
	{
		this.repository= repository;
		this.chatClient=chatClientBuilder.build();
	}
	
	

	@PostMapping
	public Map<String , String > chat(@RequestBody Map<String , String> request)
	{
		String message = request.get("message");
		
		
		if(message == null || message.isBlank())
		{
			return Map.of("reply","Please enter a message");
		}
		
		String reply =chatClient.prompt()
				                .user(message)
				                .call()
				                .content();
		
		if(reply==null || reply.isBlank())
		{
			throw new IllegalStateException("This AI model returned an empty response");
		}
		ChatMessage chatMessage = new ChatMessage(message,reply);
		repository.save(chatMessage);
		
		return Map.of("reply", reply);
	}
	
	
//	@PostMapping
//    public Map<String, String> chat(
//            @RequestBody Map<String, String> request) {
//
//        String message = request.get("message");
//        String reply;
//
//        if (message == null || message.isBlank()) {
//            reply = "Please enter a message.";
//        } else if (message.equalsIgnoreCase("hello")
//                || message.equalsIgnoreCase("hi")) {
//            reply = "Hello! How can I help you?";
//        } else {
//            reply = "You said: " + message
//                    + ". I am your chatbot assistant!";
//        }
//
//        if (message != null && !message.isBlank()) {
//            ChatMessage chatMessage =
//                    new ChatMessage(message, reply);
//
//            repository.save(chatMessage);
//        }
//
//        return Map.of("reply", reply);
//    }
//
//	
	@GetMapping("/history")
	public List<ChatMessage> getChatHistory() 
	{
		return repository.findAll(Sort.by(Sort.Direction.ASC,"id"));
		
	}
}
