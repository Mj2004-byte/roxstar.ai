# Bot Router Specifications

## Bot Routing Architecture

The `BotRouter` determines which bot (if any) responds to incoming transcriptions or text chat messages.

```mermaid
flowchart TD
    Start[Incoming Transcript / Message] --> CheckAddressed{Explicitly Addressed?}
    
    CheckAddressed -->|Contains 'AI Dost'| SelectDost[Route to Roxstar AI Dost]
    CheckAddressed -->|Contains 'AI Sathi'| SelectSathi[Route to Roxstar AI Sathi]
    CheckAddressed -->|Contains both sequentially| SelectDual[Schedule Sequential Dual Response]
    
    CheckAddressed -->|No explicit name| CheckRelevance{Is message AI / Technical / Room Query?}
    
    CheckRelevance -->|No: Human conversation e.g. 'Kal match dekha?'| Silent[NO RESPONSE - Remain Silent]
    CheckRelevance -->|Yes| CheckFollowup{Is this a follow-up to active topic?}
    
    CheckFollowup -->|Yes e.g. 'Thoda simple batao'| RouteLastBot[Route to Last Active Bot]
    CheckFollowup -->|No: New topic| BalanceBot[Select Bot based on Load/Persona Match]

    SelectDost --> TurnCheck{Speaking Lock Available?}
    SelectSathi --> TurnCheck
    SelectDual --> TurnCheck
    RouteLastBot --> TurnCheck
    BalanceBot --> TurnCheck

    TurnCheck -->|Locked by another bot| WaitOrQueue[Wait for Cooldown / Preempt]
    TurnCheck -->|Available| LockAndExecute[Acquire Lock & Start Generation]
```

## Routing Rules Summary

| Condition | Example Input | Target Action |
| :--- | :--- | :--- |
| **Explicit Addressed - Dost** | "AI Dost, tum answer karo." | `roxstar-ai-dost` responds |
| **Explicit Addressed - Sathi** | "AI Sathi, iska example do." | `roxstar-ai-sathi` responds |
| **Dual Sequential Request** | "AI Dost pehle answer karo, AI Sathi example dena." | 1. `roxstar-ai-dost` responds<br>2. `roxstar-ai-sathi` follows up with example |
| **General AI Query** | "AI kya hota hai?" | System selects `roxstar-ai-dost` or `roxstar-ai-sathi` based on persona round-robin |
| **Topic Follow-up** | "Thoda aur simple batao." | Continues with whichever bot answered the previous turn |
| **Non-AI Human-to-Human** | "Kal cricket match dekha?" | Silent (No bot responds) |
| **Speaker Memory Retrieval** | "Maine apne baare mein kya bataya tha?" | Reads speaker-specific memory for current speaker identity only |
