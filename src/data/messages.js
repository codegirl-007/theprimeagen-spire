// Personal birthday messages for Prime
// Add your real messages here - this is just the data structure

export const BIRTHDAY_MESSAGES = [
    {
        from: "codegirl007",
        message: `Happy birthday Prime! Can’t believe I kept this domain from your last birthday and renewed it for another year. But here we are, right? Haha. I think I've outdone myself this year though.

I made you a game. It’ll probably remind you of some other game. I promise it was made with care and love but I don’t promise it to be bug free. I built it in a week (give or take) so like any software engineer, my estimations were off and planning was poor and there was way more to it than I thought. Feature creep was at the utmost max. But I had a ton of fun making this.

I tried my best with reaching out to people I don't know to write you some ooey gooey messages but I'm a shy person still and I reached my limit. Haha.

Anyways, I hope you have a good birthday with your family and friends. You’ll always have my support in whatever you do. 

Stephanie (Codegirl)`
    },
    {
        from: "nilpointerr",
        message: "from feeling shitty to loving to program. prime's helped me a lot (indirectly). all the witty dad jokes , serious hot takes to skill issuing i just related to them all. thanks for streaming content, bringing great minds in TheStandup, sharing your own personal stories. hope you get well soon. yayayayayayayayayay "
    },
    
    {
        from: "ShadowCaster", 
        message: "Happy Birthday Prime! Hope you have a blazing birthday, fast fingers and even faster moves.  Keep on trucking, you one mullet of a beast!"
    },
    
    {
        from: "LowKeyAbu",
        message: `Why male models?

Two years ago, I tuned into your stream after seeing a post about addiction on Twitter. Before then, I knew you as the Vim guy on YouTube. I wasn't sure what to expect. But tuning in for the first time to find you sticking something in your earholes while all of chat was freaking out had me sold :P

At the time, life was a mess, and I was not in a great place, which led to me dealing with severe mania and psychosis. I spammed nonsense in chat, got banned, and honestly, I deserved it. But six months later, after being hospitalized, diagnosed with bipolar disorder and recovering from my episode, I was let back in. Getting unbanned probably felt small on your end, but for me it was huge. 

I love that you are open and candid about your own struggles. It made me feel less alone and seen in a world where people keep such things to themselves in fear of being judged. You don't sugarcoat, and you give it to us raw which is so damn refreshing to experience. No shit sandwiches served! Over time, I became part of your community. I made an incredible set of friends who I learn from every day while sharing laughs, KEKWs, and KEKWaits

Your streams have become my escape after long days at the office. The unhinged humor, your relentlessness, and unexpected tangents were exactly what I needed after corpo life sucked the passion and fun out of me. I've learned about your journey, not just as a coder or streamer, but as a person. I'm in awe of you.

You inspired me to start streaming myself, I've been really enjoying it and am glad to be doing something outside of work that feels fulfilling. I should've started sooner! That spark you carry and the enthusiasm you exude is hella contagious man. You're proof that hard work, consistency, and embracing the chaos makes life worth living. And even now, as you take a break to care for your voice and your family, I admire your decision. It shows strength, not weakness. You're antifragile AF and will come back stronger than ever.

Meeting you at TwitchCon and having that 1-on-1 was surreal. I'm very grateful for being invited to come on stream while I was there. It made my TwitchCon experience so much more awesome! Also, it has been scientifically proven that you give the best hugs. This is true and factual.

So, happy birthday Prime, you avocado toast eatin millennial!

I appreciate you so much. You've impacted my life more than you know.

Anyway,
But why male models?`
    },
    
    {
        from: "Shreyas", 
        message: "love you brother!! take care of your throat, we can't afford to lose prime anime noises :) Happy Birthday 🎈"
    },

    {
        from: "dingmana", 
        message: "Happy Birthday you filthy animal! You’ve made my life better. Thank you for that and I hope you can continue making your impact in whatever way you are able."
    },

    {
        from: "grimmacez", 
        message: "With the greatest Go comes the greatest Pher. Pher deez nutz in yo Elixir"
    },
    {
        from: "rodrigolj", 
        message: "I liked programming, but you made me love it. The day is yours, and the gift is our hearts. Congratulations!"
    },
];

// Simple helper function to get all messages
export function getAllMessages() {
    return BIRTHDAY_MESSAGES;
}

// Helper function to get a random message
export function getRandomMessage() {
    return BIRTHDAY_MESSAGES[Math.floor(Math.random() * BIRTHDAY_MESSAGES.length)];
}

// Helper function to get a message by index
export function getMessageByIndex(index) {
    return BIRTHDAY_MESSAGES[index] || null;
}
