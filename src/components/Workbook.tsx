import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Check, Edit2, Save, X } from 'lucide-react';
import { StepProgress } from '../lib/storage';
import type { StorageBackend } from '../lib/storageBackend';

interface Step {
  number: number;
  title: string;
  overview: string;
  corePrinciple: string;
  traumaInformed: string;
  reflectionQuestions: string[];
  murphyPractices: {
    affirmations: string[];
    lullaby: string;
    visualization: string;
    revision: string;
    mentalDiet: string;
    selfConcept: string;
  };
  meditation?: {
    title: string;
    instructions: string[];
  };
  expressiveArtsPrompt?: string;
  languageModification?: string;
  miniSummary: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: "We admitted we were powerless—that our lives had become unmanageable.",
    overview: "This step is about honest acknowledgment. You're not admitting defeat; you're recognizing that the old strategies aren't working. It's the first breath of freedom—the courage to stop pretending and start healing.",
    corePrinciple: "Honesty & Surrender",
    traumaInformed: "Powerlessness doesn't mean weakness. It means releasing the exhausting grip of control born from survival. You're safe enough now to stop fighting alone. This is an act of self-compassion, not failure.",
    reflectionQuestions: [
      "Where in my life am I trying to control outcomes I can't actually control?",
      "What patterns keep repeating despite my best efforts?",
      "How has my relationship with substances or behaviors changed over time?",
      "What am I most afraid will happen if I stop controlling everything?",
      "When did I first realize something needed to change?",
      "How has unmanageability shown up in my relationships, work, or health?",
      "What does surrender mean to me? What doesn't it mean?",
      "What would it feel like to let go, even just a little?",
      "What stories have I been telling myself about why I can manage this alone?",
      "How might admitting powerlessness actually be an act of courage?",
      "What part of me is ready to stop fighting and start healing?",
      "What am I protecting by staying in control?",
      "How has denial or minimization kept me stuck?",
      "What would I do differently if I truly believed I deserved help?",
      "What does my body want me to know about this step?"
    ],
    murphyPractices: {
      affirmations: [
        "I release the need to control what I cannot change.",
        "I am safe enough to surrender and receive support.",
        "My powerlessness is the doorway to true freedom.",
        "I trust that admitting the truth is the beginning of healing.",
        "I allow divine wisdom to guide me beyond my limitations."
      ],
      lullaby: "As you drift to sleep tonight, softly repeat: 'I am held, I am safe, I am free to let go.' Feel the relief of releasing control. Let your subconscious absorb this truth while you rest.",
      visualization: "Close your eyes and imagine yourself standing at the edge of a peaceful river. In your hands, you hold a heavy stone—it represents control, fear, unmanageability. Feel its weight. Now, with compassion, place it gently into the water and watch it sink. Notice the lightness in your hands, the space in your chest. You are free.",
      revision: "Think of a moment when you felt overwhelmed, out of control, or ashamed. Now reimagine it: you're surrounded by calm, loving presence. You ask for help. You receive it. You are safe. Replay this version until it feels more real than the original.",
      mentalDiet: "Notice when you think: 'I should be able to handle this alone' or 'I'm failing.' Pause. Replace it with: 'I am brave for recognizing my limits. I am worthy of support.'",
      selfConcept: "I am someone who is honest with myself. I am someone who chooses healing over hiding. I am someone worthy of peace and support."
    },
    meditation: {
      title: "Basic Grounding Meditation",
      instructions: [
        "Take a posture that feels sustainable for the amount of time you have scheduled.",
        "Notice contact points. If seated in a chair, notice your back against the chair, your seat, the backs of your legs, your feet on the floor.",
        "Notice other contact points, like your arms against your body, and your hands wherever they rest.",
        "Notice if one or more of these points feels grounded, or more grounded than the others. If you notice 'I don't feel particularly grounded,' see if you can notice that lack of grounding with as little judgment as possible.",
        "If you do feel some grounding somewhere, go ahead and lean into that grounding. Let yourself have that ground.",
        "For the remainder of this meditation, allow yourself to continue to lean into that ground. If anything changes, let yourself notice it and move with it if necessary. Reground yourself at any time.",
        "Five minutes a day is just fine, and if five minutes is too long, one minute is just fine. The key is to practice daily or as consistently as possible."
      ]
    },
    expressiveArtsPrompt: "If freewriting alone on Step One does not feel sufficient, is there a way you can bring in another expressive practice (e.g., visual art, fiction, or poetry writing, playlist construction, songwriting, dancing, or acting out a dramatic scene—even if it's something as simple as making a gesture or series of gestures that reflects what this step means to you at this point in your journey)?",
    languageModification: "The step does not say that we are powerless people. The step simply says that we are powerless when it comes to alcohol, drugs, etc. This means that if we put alcohol or drugs into our body, they will win every time. By admitting defeat, we are carving the pathway to reclaim our power on the road ahead.",
    miniSummary: "I carry forward the truth that honesty is the beginning of freedom, and surrender is not defeat—it is courage."
  },
  {
    number: 2,
    title: "We came to believe that a Power greater than ourselves could restore us to sanity.",
    overview: "This is the step of hope. You don't need to have it all figured out. You're simply opening to the possibility that something—love, nature, connection, the universe, a higher wisdom—can help heal what feels broken.",
    corePrinciple: "Hope & Faith",
    traumaInformed: "Belief can be difficult when trust has been broken. This step asks only for willingness, not certainty. You don't need religious faith—just openness to the idea that healing is possible and you don't have to do it alone.",
    reflectionQuestions: [
      "What does 'sanity' mean to me? What does it look like?",
      "When have I felt connected to something larger than myself?",
      "What gives me hope, even in small moments?",
      "How do I define 'a Power greater than myself'? Does it need a name?",
      "Where have I seen evidence that change is possible?",
      "What would it feel like to believe I could be restored?",
      "What blocks me from trusting in support beyond myself?",
      "How has isolation or self-reliance kept me from receiving help?",
      "What would I need to feel safe enough to believe?",
      "Can I remember a time when I felt held or guided by something beyond my understanding?",
      "What small sign of hope can I notice today?",
      "How might my body or intuition guide me toward healing?",
      "What does restoration mean for me personally?",
      "Am I willing to be open to the possibility of support, even if I don't fully believe yet?",
      "What would change in my life if I truly believed healing was possible?"
    ],
    murphyPractices: {
      affirmations: [
        "I am open to the possibility of healing and restoration.",
        "I trust that something greater than my fear is guiding me.",
        "Hope is growing within me, even when I can't see it.",
        "I allow myself to believe that sanity and peace are my birthright.",
        "I am supported by a loving intelligence that wants my highest good."
      ],
      lullaby: "Before sleep, whisper gently: 'I am being restored. Hope is working within me. I am held by love.' Let your mind rest in this peaceful knowing.",
      visualization: "Imagine a warm, golden light above you—pure loving energy. See it slowly descending, filling every part of your body with hope, healing, and peace. Feel it dissolving fear and doubt. You are being restored.",
      revision: "Recall a moment when you felt hopeless or abandoned. Now reimagine it: a gentle presence appears—a feeling, a memory, a sense of being held. You are not alone. You never were. Let this version settle into your heart.",
      mentalDiet: "When you notice thoughts like 'Nothing will help' or 'I'm beyond repair,' pause. Gently replace them with: 'I am willing to believe. Healing is already beginning.'",
      selfConcept: "I am someone who is open to hope. I am someone who can receive support. I am someone worthy of restoration and peace."
    },
    meditation: {
      title: "Meditation: Befriending Your Breath",
      instructions: [
        "You may close your eyes, leave them open, or experiment with the two. Whichever position will help you feel safe enough yet stay engaged with the practice is optimal.",
        "Engage in the shoulder crunch and release at least three more times. Every time you release, try to pay a little more attention to how your breath responds to the release.",
        "Move into at least thirty seconds of just noticing the breath as it naturally rises and falls in your body. You do not have to do anything special with technique, simply notice. Does your breath feel warm, cool, or neutral moving through your body?",
        "You may notice that your mind starts to wander. This is normal! Instead of judging yourself, see if you can invite the attention back to the breath when you notice it wandering.",
        "Some people find it helpful to hold a grounding or anchoring object in their hand while they try this exercise (e.g., a rock, a recovery coin).",
        "Another favorite anchoring device is to repeat as you breathe: 'As I breathe in, I know I am breathing in. As I breathe out, I know I am breathing out.' You can simply modify this to 'In' (as you breathe in) and 'Out' (as you breathe out)."
      ]
    },
    expressiveArtsPrompt: "If freewriting alone on Step Two does not feel sufficient, is there a way you can bring in another expressive practice (e.g., visual art, fiction, or poetry writing, playlist construction, songwriting, dancing, or acting out a dramatic scene—even if it's something as simple as making a gesture or series of gestures that reflects what this step means to you at this point in your journey)?",
    languageModification: "A great struggle with this step is the element of spirituality it introduces. However, if a trauma survivor relied on the fight of self-sufficiency to get through the trauma, it may be very difficult for them to accept that something outside of themselves is going to help them heal. The word 'sanity' also poses an interesting challenge. If we need to be 'restored to sanity,' then we must be insane! Consider using the word 'unhealthy' for now if 'sanity' feels triggering.",
    miniSummary: "I carry forward the truth that hope is real, healing is possible, and I am not alone in this journey."
  },
  {
    number: 3,
    title: "We made a decision to turn our will and our lives over to the care of a Power greater than ourselves.",
    overview: "This is the step of decision and trust. You're not giving up your autonomy—you're choosing to align with something wiser, kinder, and more loving than fear. It's a daily practice of letting go and leaning in.",
    corePrinciple: "Trust & Commitment",
    traumaInformed: "Turning things over can feel terrifying if you've learned that trusting others leads to harm. This step is about trusting life itself, your own healing capacity, and a benevolent force. Go at your own pace. Trust grows slowly.",
    reflectionQuestions: [
      "What does 'turning it over' mean to me?",
      "What am I afraid will happen if I stop trying to control everything?",
      "How would my life look different if I trusted that I'm being guided?",
      "What does my will want? What does a higher wisdom want for me?",
      "Where am I holding on too tightly?",
      "What would it feel like to make this decision daily, rather than perfectly?",
      "How can I practice small acts of trust today?",
      "What does 'care' mean to me? How do I imagine being cared for?",
      "What parts of my life am I ready to release? What parts am I not ready for yet?",
      "How has my will served me? How has it also limited me?",
      "What would I do differently today if I believed I was being guided?",
      "How can I honor both my agency and my need for support?",
      "What does commitment to my healing look like?",
      "Can I trust without certainty? Can I act with faith even when I'm scared?",
      "What truth is my heart whispering to me right now?"
    ],
    murphyPractices: {
      affirmations: [
        "I trust the loving intelligence guiding my life.",
        "I release my will to a higher wisdom that knows my path.",
        "I am safe to let go and be led.",
        "My decision to trust is renewed each day with compassion.",
        "I align my mind and heart with the highest good for my life."
      ],
      lullaby: "As you fall asleep, breathe slowly and repeat: 'I let go. I trust. I am guided by love.' Feel the peace of surrender wash over you.",
      visualization: "Picture yourself standing at a crossroads. One path is familiar, exhausting, full of control and fear. The other is soft, lit with gentle light, and inviting. You take a step toward the light. With each step, you feel lighter, safer, more at peace. This is the path of trust.",
      revision: "Think of a time you tried to control something and it went badly. Reimagine it: you pause, breathe, and say, 'I trust this will unfold as it should.' You let go. The outcome is peaceful, even if different than you planned. Let this feeling become real.",
      mentalDiet: "Notice when your mind spirals into control, worry, or forcing. Pause. Say to yourself: 'I choose to trust. I release this to higher care.' Return to your breath.",
      selfConcept: "I am someone who trusts wisely. I am someone who can surrender with courage. I am someone aligned with love and healing."
    },
    meditation: {
      title: "Meditation: Higher or Inner Power Visualization",
      instructions: [
        "Begin by coming into at least thirty seconds of mindful breathing with your eyes closed or opened. Do whatever you may need to in order to feel supported and grounded before engaging in breath.",
        "Set an intention to work with the essence of Step Three for this meditation and ask yourself, through the breath, what needs to be revealed. Begin by asking which terminology may work best for you: God, Higher Power, Inner Power, spirit, the universe, humankind, the Greater Good, or something completely different.",
        "Notice what is revealed without forcing it and learn to listen to that vital spark that says, 'This is it!' You will likely know it if you feel it. If nothing particularly resonates for you the first time, that's okay too. You can always try this as many times as you need to.",
        "After the term that works for you reveals itself, spend at least thirty seconds reflecting on it. With every breath, connect to it. Begin noticing how the body feels.",
        "Notice if anything emerges visually. The less you force it, the more likely your connection will happen. For some people the visual that shows up looks like a person or group of people, for others it's more like a light or even a sensation.",
        "You cannot do anything wrong here! This may mean that you need to intentionally send away any old pictures or conceptualizations of what you were taught 'God' or 'Higher Power' needed to look like. You can literally shake it off or flick your hands to the ground in release.",
        "Whenever you see or sense into what is revealed, spend as much time as you need noticing it without judgment. Notice what happens in your breath. Notice what happens to your body."
      ]
    },
    expressiveArtsPrompt: "If freewriting alone on Step Three does not feel sufficient, is there a way you can bring in another expressive practice (e.g., visual art, fiction or poetry writing, playlist construction, songwriting, dancing, or acting out a dramatic scene—even if it's something as simple as making a gesture or series of gestures that reflects what this step means to you at this point in your journey)?",
    languageModification: "Although the step references God, you are completely free to define God/Higher Power/Inner Power or any alternative concept as you see fit. This may fly in the face of how you were raised or feel like it's egotistical for you to do the defining. Your self-esteem could also feel so low right now that you're filled with ideas that anything you conceptualize cannot possibly be good. See if you can set all of this aside and simply riff on how you need to conceptualize God/Higher Power, etc. in a way that works for you and your recovery today.",
    miniSummary: "I carry forward the truth that trust is a daily practice, and letting go is not loss—it is freedom."
  },
  {
    number: 4,
    title: "We made a searching and fearless moral inventory of ourselves.",
    overview: "This step invites you to look honestly at your patterns, beliefs, and behaviors—not to shame yourself, but to understand yourself. It's an act of compassionate self-examination, seeing where you've been hurt and where you've caused harm.",
    corePrinciple: "Self-Awareness & Courage",
    traumaInformed: "Inventory is not about self-blame. You're not listing all your 'failures.' You're exploring your story with kindness—what you learned, what you carried, what survival strategies you developed. Take breaks. Go gently. You are not your behaviors.",
    reflectionQuestions: [
      "What patterns keep showing up in my relationships?",
      "Where do I feel resentment, and what is it protecting?",
      "What fears have been driving my decisions?",
      "How have I hurt others, even unintentionally?",
      "How have I hurt myself?",
      "What survival behaviors did I develop in childhood that no longer serve me?",
      "What am I most ashamed of? Can I look at it with compassion?",
      "Where do I avoid responsibility? Where do I take too much?",
      "What beliefs about myself have I been carrying that aren't true?",
      "How has trauma shaped the way I see myself and others?",
      "What strengths and gifts do I also carry?",
      "What do I need to forgive myself for?",
      "How has my behavior impacted my sense of self-worth?",
      "What do I want to let go of from my past?",
      "What truth is ready to be acknowledged and released?"
    ],
    murphyPractices: {
      affirmations: [
        "I look at my past with compassion and courage.",
        "I am more than my mistakes; I am a soul learning and growing.",
        "I release shame and embrace understanding.",
        "I trust that self-awareness leads to freedom.",
        "I am safe to see myself fully and love myself anyway."
      ],
      lullaby: "Tonight, as you rest, whisper: 'I see myself clearly. I forgive myself deeply. I am healing.' Let your subconscious integrate this truth as you sleep.",
      visualization: "Imagine yourself sitting with a wise, loving presence—maybe an elder, a guide, or your future self. They look at you with total compassion. They say: 'I see all of you—the pain, the mistakes, the beauty. You are worthy of love.' Feel this acceptance in your body.",
      revision: "Choose a memory that brings shame or regret. Reimagine it with your current wisdom and compassion. See yourself responding differently, or simply being held with love despite the mistake. Let this new version become part of your story.",
      mentalDiet: "When self-judgment arises—'I'm terrible,' 'I always mess up'—pause. Replace it with: 'I am learning. I am human. I am worthy of compassion.'",
      selfConcept: "I am someone who looks at myself honestly. I am someone who chooses growth over shame. I am someone deserving of my own kindness."
    },
    meditation: {
      title: "Meditation: Loving Kindness",
      instructions: [
        "First, take a posture that feels sustainable for the amount of time you have scheduled for this meditation.",
        "Notice contact points. If you are seated in a chair, notice the sensation of your back against the chair, your seat, the backs of your legs, your feet on the floor.",
        "Notice other contact points, like your arms against your body, and your hands wherever they rest.",
        "Notice if one or more of these points of contact feels grounded. If what you notice is 'I don't feel particularly grounded,' then see if you can notice that lack of grounding with as little judgment as possible.",
        "Begin to silently repeat the loving kindness phrases: 'May I be free from fear; May I be healthy (or healed); May I be happy; May I be at ease.' You can start with three rounds of these phrases for yourself.",
        "Now begin emanating these phrases outward. You might start with someone it is easy to send loving kindness to, like a loved one or a pet. 'May you be free from fear; May you be healthy; May you be happy; May you be at ease.'",
        "You can then move outward incrementally, sending it to everyone on your block, everyone in your city, your country, this world. For the last round, consider sending one more set of these phrases back toward yourself.",
        "As with other meditations, we are looking here not for quantity, but rather for consistency of practice. Five minutes is just fine, and if five minutes is too long, one minute is just fine."
      ]
    },
    expressiveArtsPrompt: "If freewriting alone on Step Four does not feel sufficient, is there a way you can bring in another expressive practice (e.g., visual art, fiction or poetry writing, playlist construction, songwriting, dancing, or acting out a dramatic scene—even if it's something as simple as making a gesture or series of gestures that reflects what the step means to you at this point in your journey)?",
    languageModification: "Step Four should never be a punishment, rather it is an opportunity to take stock—a natural extension of what may have led us to approach this program or work a Step One in the first place. If I can reword and thus rethink this step as 'taking stock' of the things I see about myself, both healthy/unhealthy and everything in between, might that ease some of the anxiety around the concept of 'moral inventory'?",
    miniSummary: "I carry forward the truth that self-awareness is an act of love, and I am more than my past."
  },
  {
    number: 5,
    title: "We admitted to our Higher Power, to ourselves, and to another human being the exact nature of our wrongs.",
    overview: "This step is about breaking isolation. Shame thrives in secrecy. When you speak your truth aloud to someone safe, you release its power. This is vulnerability as healing.",
    corePrinciple: "Vulnerability & Connection",
    traumaInformed: "Choose someone who is safe, trustworthy, and non-judgmental. This is not about confession or punishment—it's about being witnessed with compassion. If you're not ready to share everything, that's okay. Start small. Healing happens in relationship.",
    reflectionQuestions: [
      "Who feels safe enough to hear my truth?",
      "What am I most afraid to say out loud?",
      "How has keeping secrets affected my sense of self?",
      "What would it feel like to be fully seen and still loved?",
      "How has isolation kept me stuck?",
      "What do I need to release by speaking it aloud?",
      "What judgments do I fear from others? From myself?",
      "How can I prepare myself to be vulnerable?",
      "What support do I need before and after this step?",
      "What does it mean to admit something to my Higher Power?",
      "How might speaking my truth change my relationship with shame?",
      "What part of me is ready to be witnessed?",
      "How can I honor my pace and my boundaries in this process?",
      "What would I want someone to say to me after I share?",
      "How might this step bring me closer to freedom?"
    ],
    murphyPractices: {
      affirmations: [
        "I am safe to be vulnerable with trustworthy people.",
        "Speaking my truth releases shame and invites healing.",
        "I am worthy of being seen and loved as I am.",
        "My story is sacred, and sharing it is an act of courage.",
        "I trust that vulnerability brings me closer to connection and peace."
      ],
      lullaby: "As you drift to sleep, softly repeat: 'I am safe to be seen. I am safe to be known. I am loved.' Let this truth settle into every cell.",
      visualization: "Imagine yourself sitting across from someone who loves you unconditionally. You begin to share your story. As you speak, you see light leaving your chest—old shame, old pain. They hold space with love. You feel lighter. You feel free.",
      revision: "Recall a time you felt judged or rejected for being honest. Reimagine it: you share, and you are met with compassion, understanding, and love. You are safe. This is the truth. Let this new memory replace the old.",
      mentalDiet: "When fear says, 'If they really knew me, they'd leave,' pause. Replace it with: 'I am worthy of love and acceptance. My truth is safe with the right people.'",
      selfConcept: "I am someone who is brave enough to be vulnerable. I am someone who deserves to be seen and loved fully. I am someone who breaks the cycle of shame."
    },
    miniSummary: "I carry forward the truth that vulnerability is strength, and being witnessed with love is deeply healing."
  },
  {
    number: 6,
    title: "We were entirely ready to have our Higher Power remove all these defects of character.",
    overview: "This step is about willingness. You're not perfect, and you don't need to be. You're simply becoming ready to release old patterns, defenses, and ways of being that no longer serve you. Readiness is enough.",
    corePrinciple: "Willingness & Humility",
    traumaInformed: "Your 'defects' are often survival strategies that once protected you. Honor them for what they did. And when you're ready, you can gently let them go. This step is about becoming willing, not forcing change.",
    reflectionQuestions: [
      "What patterns or behaviors am I ready to release?",
      "What am I still afraid to let go of? Why?",
      "How have my 'defects' actually served or protected me?",
      "What would my life look like without these patterns?",
      "What does 'entirely ready' mean to me?",
      "Am I willing to be willing, even if I'm scared?",
      "What might I need to grieve as I let these patterns go?",
      "How can I hold compassion for the parts of me that are resistant?",
      "What support do I need to feel safe enough to change?",
      "What does readiness feel like in my body?",
      "How might my life improve if I released these patterns?",
      "What new ways of being am I inviting in?",
      "How can I trust that I won't lose myself by changing?",
      "What does humility mean in this context?",
      "What am I being called to become?"
    ],
    murphyPractices: {
      affirmations: [
        "I am willing to release what no longer serves me.",
        "I trust that I am safe to change and grow.",
        "I honor my past patterns and gently let them go.",
        "I am ready to become the fullest version of myself.",
        "I allow divine love to transform me with grace and ease."
      ],
      lullaby: "Before sleep, whisper: 'I am ready. I release. I am becoming.' Feel the gentle shift happening within you as you rest.",
      visualization: "Picture yourself in a peaceful room. In your hands, you hold old clothes—worn, tattered, no longer fitting. You fold them with gratitude and set them down. Beside you are new clothes—soft, radiant, perfectly suited. You put them on. You are ready.",
      revision: "Think of a time you acted from an old pattern—control, people-pleasing, avoidance. Reimagine it: you pause, breathe, and choose differently. You respond with your new wisdom. You feel free. Let this version become your truth.",
      mentalDiet: "When you notice resistance—'I can't change,' 'This is just who I am'—pause. Replace it with: 'I am allowed to grow. Change is safe and natural.'",
      selfConcept: "I am someone who is ready to evolve. I am someone who releases the old with grace. I am someone becoming more whole every day."
    },
    miniSummary: "I carry forward the truth that willingness opens the door, and I am ready to release what no longer serves my highest good."
  },
  {
    number: 7,
    title: "We humbly asked our Higher Power to remove our shortcomings.",
    overview: "This is the step of asking. You've become willing; now you release the burden of fixing yourself. You ask for help. You trust that transformation happens through grace, not force.",
    corePrinciple: "Humility & Surrender",
    traumaInformed: "Asking for help can be vulnerable, especially if you've learned that needing support is weakness. This step is a practice of self-compassion—acknowledging that you don't have to carry everything alone. Transformation is a collaborative process.",
    reflectionQuestions: [
      "What does it mean to 'humbly ask'?",
      "How does it feel to ask for help?",
      "What am I asking to be removed from my life?",
      "What would change if I truly believed I didn't have to fix myself alone?",
      "How has pride or shame kept me from asking?",
      "What does humility look like for me?",
      "Can I trust that asking is enough, even if the change feels slow?",
      "What would it feel like to release the pressure of self-improvement?",
      "How might my Higher Power be already working within me?",
      "What signs of transformation have I already noticed?",
      "What do I need to accept about myself in this process?",
      "How can I practice patience with my own growth?",
      "What does grace mean to me?",
      "Am I willing to let go of control over how I change?",
      "What would I do today if I trusted that I am being transformed?"
    ],
    murphyPractices: {
      affirmations: [
        "I humbly ask for help, and I trust I am heard.",
        "I release the need to fix myself; I am being healed.",
        "Transformation happens through me, not by me.",
        "I trust divine love to remove what I cannot release alone.",
        "I am worthy of grace, ease, and gentle change."
      ],
      lullaby: "Tonight, repeat softly: 'I ask. I trust. I release. I am being transformed.' Let your subconscious absorb this as you sleep.",
      visualization: "Imagine yourself kneeling or sitting before a warm, radiant light. You speak your request with humility and trust. The light surrounds you, lifting away old patterns like dust. You feel lighter, freer, loved. You are being transformed.",
      revision: "Recall a time you struggled to change and felt defeated. Reimagine it: you pause and ask for help. Support arrives—internal or external. The change happens naturally, gently. You feel relief. Let this truth replace the old story.",
      mentalDiet: "When you think, 'I have to do this myself' or 'Nothing's changing,' pause. Replace it with: 'I am being helped. Change is happening. I trust the process.'",
      selfConcept: "I am someone who asks for what I need. I am someone who trusts in grace. I am someone being gently transformed every day."
    },
    miniSummary: "I carry forward the truth that asking is powerful, and transformation happens not by force, but by grace."
  },
  {
    number: 8,
    title: "We made a list of all persons we had harmed, and became willing to make amends to them all.",
    overview: "This step is about accountability and preparation. You're creating clarity around the impact of your actions. Willingness is the focus here—not the amends themselves yet. You're simply opening your heart to the possibility of repair.",
    corePrinciple: "Accountability & Preparation",
    traumaInformed: "This list includes people you've harmed, but also notice where you've harmed yourself. Not all relationships are safe to re-enter. Becoming willing doesn't mean ignoring your own safety or boundaries. Healing includes discernment.",
    reflectionQuestions: [
      "Who have I hurt through my actions, words, or neglect?",
      "How have I hurt myself?",
      "What relationships have been damaged by my behavior?",
      "What harm was unintentional? What was intentional?",
      "How do I feel as I make this list—guilt, relief, grief, resistance?",
      "Am I willing to make amends, even if it's uncomfortable?",
      "What fears arise when I think about apologizing or making repairs?",
      "Who on this list might not be safe to approach?",
      "What amends can I make to myself?",
      "How has avoiding accountability kept me stuck?",
      "What does accountability mean to me?",
      "How can I honor both my responsibility and my own healing?",
      "What would willingness feel like in my body?",
      "What would change if I truly believed repair was possible?",
      "What truth am I being called to acknowledge?"
    ],
    murphyPractices: {
      affirmations: [
        "I am willing to acknowledge the harm I have caused.",
        "I trust that accountability is a path to freedom.",
        "I honor my responsibility and my own healing.",
        "I am brave enough to make repairs where it is safe.",
        "I release guilt and embrace willingness and compassion."
      ],
      lullaby: "As you fall asleep, softly repeat: 'I am willing. I am accountable. I am healing.' Let this truth settle into your heart as you rest.",
      visualization: "Imagine yourself writing names on pieces of paper. As you write, you feel emotions—grief, regret, love. You place each paper in a gentle stream. The water blesses each name. You are willing. You are ready.",
      revision: "Think of a relationship you've damaged. Reimagine it: you approach with humility and compassion, you acknowledge harm, and you are met with understanding. Even if this hasn't happened yet, let this version live in your heart.",
      mentalDiet: "When guilt spirals—'I've ruined everything'—pause. Replace it with: 'I am willing to make repairs. I am learning accountability with compassion.'",
      selfConcept: "I am someone who takes responsibility with love. I am someone who is willing to repair and heal. I am someone worthy of forgiveness and growth."
    },
    miniSummary: "I carry forward the truth that accountability is an act of love, and willingness to repair is the beginning of freedom."
  },
  {
    number: 9,
    title: "We made direct amends to such people wherever possible, except when to do so would injure them or others.",
    overview: "This is the step of repair. You approach those you've harmed—when it's safe and appropriate—and make things right. This is not about perfection or being forgiven; it's about integrity, humility, and taking responsibility.",
    corePrinciple: "Integrity & Repair",
    traumaInformed: "Not all amends are safe to make directly. Some people are no longer in your life, and that's okay. Some amends are made through changed behavior, not words. Protect yourself and others. Repair doesn't require re-traumatization.",
    reflectionQuestions: [
      "Who is safe for me to approach for direct amends?",
      "What amends need to be made through actions, not words?",
      "How do I prepare myself emotionally for this step?",
      "What do I want to say? What do I need to acknowledge?",
      "What outcomes am I attached to? Can I release those?",
      "What amends would cause more harm than healing?",
      "How can I make amends to myself?",
      "What support do I need before and after making amends?",
      "How do I honor the other person's response, whatever it may be?",
      "What does integrity mean to me in this process?",
      "What amends have I already made through changed behavior?",
      "How can I practice self-compassion as I take responsibility?",
      "What would it feel like to complete this step with love and honesty?",
      "How might making amends change my relationship with myself?",
      "What truth is ready to be spoken?"
    ],
    murphyPractices: {
      affirmations: [
        "I approach amends with courage, humility, and love.",
        "I take responsibility for my actions without attachment to outcomes.",
        "I trust that repair is healing for me and others.",
        "I honor both accountability and my own safety.",
        "I am worthy of integrity and peace."
      ],
      lullaby: "Tonight, whisper gently: 'I repair what I can. I release what I can't. I am at peace.' Let this truth comfort you as you sleep.",
      visualization: "Imagine yourself approaching someone you've harmed. You speak with honesty and humility. You acknowledge impact. Whatever their response, you feel lighter. You've done your part. You are free.",
      revision: "Think of an amends conversation you fear. Reimagine it going as well as it possibly could—compassion, understanding, mutual healing. Let this version live in your body, calming your nervous system.",
      mentalDiet: "When fear arises—'They'll hate me' or 'It won't matter'—pause. Replace it with: 'I show up with integrity. The outcome is not mine to control. I am doing my part.'",
      selfConcept: "I am someone who takes responsibility with grace. I am someone who repairs with love. I am someone committed to integrity and healing."
    },
    miniSummary: "I carry forward the truth that repair is an act of courage, and integrity brings freedom—regardless of the outcome."
  },
  {
    number: 10,
    title: "We continued to take personal inventory and when we were wrong promptly admitted it.",
    overview: "This step is about daily practice. Recovery isn't a destination; it's a way of living. You stay aware, you acknowledge mistakes as they happen, you course-correct with humility and grace.",
    corePrinciple: "Ongoing Awareness & Humility",
    traumaInformed: "This isn't about perfectionism or constant self-monitoring. It's about gentle, ongoing self-awareness. Notice patterns. Acknowledge mistakes. Repair quickly. Celebrate growth. Be kind to yourself in the process.",
    reflectionQuestions: [
      "How can I practice daily self-reflection without judgment?",
      "What patterns am I noticing in my current behavior?",
      "Where did I act out of alignment with my values today?",
      "How quickly do I acknowledge mistakes?",
      "What prevents me from admitting when I'm wrong?",
      "How can I balance accountability with self-compassion?",
      "What does 'promptly' mean for me?",
      "How am I growing? What progress have I made?",
      "What do I need to celebrate about myself today?",
      "How can I make this step a loving practice, not a punishing one?",
      "What daily rituals support my self-awareness?",
      "How do I respond when I notice I've caused harm?",
      "What amends do I need to make today, even small ones?",
      "How is this step helping me live with more integrity?",
      "What does ongoing recovery look like for me?"
    ],
    murphyPractices: {
      affirmations: [
        "I practice daily awareness with compassion and honesty.",
        "I acknowledge my mistakes quickly and repair with grace.",
        "I am committed to living with integrity each day.",
        "I celebrate my growth and honor my humanity.",
        "I trust that ongoing self-reflection brings lasting freedom."
      ],
      lullaby: "Each night before sleep, review your day with kindness. Acknowledge what went well and what you'd do differently. Whisper: 'I learn, I grow, I am at peace.' Let this practice bring you rest.",
      visualization: "Imagine yourself at the end of each day, sitting quietly. You review your actions like watching a gentle movie. When you see misalignment, you note it with love, not judgment. You imagine making repairs. You feel clear, light, and at peace.",
      revision: "When you notice a mistake, pause and reimagine your response: you acknowledge it immediately, you apologize or repair, you forgive yourself, you move forward. Let this become your automatic response.",
      mentalDiet: "When you notice defensiveness or denial—'I didn't do anything wrong'—pause. Ask gently: 'What's the truth here? Where can I take responsibility?' Replace defensiveness with curiosity.",
      selfConcept: "I am someone who practices awareness daily. I am someone who admits mistakes with ease. I am someone committed to integrity and growth."
    },
    miniSummary: "I carry forward the truth that recovery is a daily practice, and living with awareness brings lasting peace."
  },
  {
    number: 11,
    title: "We sought through prayer and meditation to improve our conscious contact with our Higher Power, praying only for knowledge of its will for us and the power to carry that out.",
    overview: "This step is about deepening your spiritual practice. You create space to listen, to connect, to receive guidance. This isn't about religious dogma—it's about cultivating inner peace and alignment with your highest good.",
    corePrinciple: "Spiritual Connection & Guidance",
    traumaInformed: "Prayer and meditation can feel unfamiliar or triggering if you have religious trauma. Define these practices in your own way—journaling, walking in nature, breathwork, silence. The goal is connection, not performance.",
    reflectionQuestions: [
      "What does prayer mean to me?",
      "What does meditation mean to me?",
      "How do I feel most connected to something greater?",
      "What spiritual practices bring me peace?",
      "How do I discern the difference between my will and higher will?",
      "What does 'conscious contact' feel like in my body?",
      "What guidance am I seeking right now?",
      "How can I create daily space for stillness and listening?",
      "What blocks me from connecting spiritually?",
      "How do I know when I'm aligned with my highest good?",
      "What would it feel like to trust that I'm being guided?",
      "How might spiritual practice support my recovery?",
      "What does 'the power to carry that out' mean for me?",
      "How can I make this practice sustainable and personal?",
      "What is my heart longing to know or receive?"
    ],
    murphyPractices: {
      affirmations: [
        "I am deeply connected to the wisdom guiding my life.",
        "I listen for guidance with an open heart and quiet mind.",
        "I trust the power within me to carry out my highest good.",
        "I align my will with love, peace, and truth.",
        "I am supported by a loving intelligence that knows my path."
      ],
      lullaby: "Before sleep, breathe deeply and repeat: 'I am guided. I am connected. I trust.' Let this truth settle into your subconscious as you rest.",
      visualization: "Imagine yourself in a sacred space—a forest, a temple, a quiet room. You sit in stillness. You ask a question and then listen. An answer arrives—as a feeling, an image, a knowing. You trust it. You feel peace.",
      revision: "Recall a time you felt lost or disconnected. Reimagine it: you pause, you breathe, you ask for guidance. Clarity comes. You feel held. Let this become your truth.",
      mentalDiet: "When your mind is noisy or anxious, pause. Return to your breath. Silently ask: 'What do I need to know right now?' Listen for the quiet answer beneath the noise.",
      selfConcept: "I am someone who is spiritually connected. I am someone who listens for guidance. I am someone aligned with my highest good."
    },
    miniSummary: "I carry forward the truth that spiritual connection is my anchor, and listening for guidance brings clarity and peace."
  },
  {
    number: 12,
    title: "Having had a spiritual awakening as the result of these Steps, we tried to carry this message and to practice these principles in all our affairs.",
    overview: "This is the step of integration and service. You've been transformed. Now you live differently. You share your experience, strength, and hope. You practice these principles in every area of your life. This is the beginning, not the end.",
    corePrinciple: "Service & Integration",
    traumaInformed: "Spiritual awakening doesn't mean perfection or arrival. It means you're more awake, more aware, more alive. Carrying the message isn't about preaching—it's about living with integrity and offering support to others when appropriate. Your healing becomes a gift.",
    reflectionQuestions: [
      "What has awakened in me through these steps?",
      "How have I changed since I began this journey?",
      "What does 'spiritual awakening' mean to me personally?",
      "How do I want to share my experience with others?",
      "What principles am I committed to practicing daily?",
      "Where can I offer support, service, or hope?",
      "How do I balance helping others with caring for myself?",
      "What does 'practicing these principles in all my affairs' look like?",
      "How do I honor my growth without becoming self-righteous?",
      "What does service mean to me?",
      "How might my healing help others heal?",
      "What boundaries do I need to maintain while being of service?",
      "How do I keep my spiritual practice alive and evolving?",
      "What am I being called to do with what I've learned?",
      "What does the rest of my recovery journey look like?"
    ],
    murphyPractices: {
      affirmations: [
        "I have been transformed, and I live with new awareness.",
        "I share my experience, strength, and hope with love.",
        "I practice spiritual principles in every area of my life.",
        "I am of service without losing myself.",
        "I trust that my healing contributes to the healing of others."
      ],
      lullaby: "Tonight, as you rest, whisper: 'I am awakened. I am of service. I live with love.' Let this truth guide your dreams and your days.",
      visualization: "Imagine yourself as a radiant light. Your healing has made you brighter. Others are drawn to your warmth. You share your story, and it helps someone else find hope. You feel connected, purposeful, alive. This is your legacy.",
      revision: "Think of your past self—lost, struggling, in pain. Now reimagine meeting them as your current self. You offer compassion, hope, and guidance. You tell them they will heal. You watch them believe you. Let this image remind you how far you've come.",
      mentalDiet: "When you forget your growth or feel lost, pause. Remind yourself: 'I have been transformed. I practice love daily. I am enough.' Return to your principles.",
      selfConcept: "I am someone who has awakened to a new way of living. I am someone who serves with love. I am someone who practices spiritual principles every day."
    },
    miniSummary: "I carry forward the truth that I have been transformed, and my healing is a gift I share by living with integrity, love, and service."
  }
];

interface WorkbookProps {
  storage: StorageBackend;
}

export function Workbook({ storage }: WorkbookProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [stepProgress, setStepProgress] = useState<StepProgress[]>([]);
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [currentNotes, setCurrentNotes] = useState('');
  const [editingReflections, setEditingReflections] = useState<{ [key: string]: string }>({});

  const loadStepProgress = useCallback(async () => {
    const progress = await storage.getStepProgress();
    setStepProgress(progress);
  }, [storage]);

  useEffect(() => {
    loadStepProgress();
  }, [loadStepProgress]);

  const toggleStep = (stepNumber: number) => {
    setExpandedStep(expandedStep === stepNumber ? null : stepNumber);
  };

  const getStepProgress = (stepNumber: number): StepProgress => {
    return stepProgress.find(s => s.stepNumber === stepNumber) || {
      stepNumber,
      completed: false,
      notes: '',
      reflectionAnswers: {},
      lastUpdated: new Date().toISOString(),
    };
  };

  const toggleStepComplete = async (stepNumber: number) => {
    const current = getStepProgress(stepNumber);
    await storage.updateStepProgress(stepNumber, { completed: !current.completed });
    await loadStepProgress();
  };

  const startEditingNotes = (stepNumber: number) => {
    const current = getStepProgress(stepNumber);
    setCurrentNotes(current.notes);
    setEditingNotes(stepNumber);
  };

  const saveNotes = async (stepNumber: number) => {
    await storage.updateStepProgress(stepNumber, { notes: currentNotes });
    await loadStepProgress();
    setEditingNotes(null);
    setCurrentNotes('');
  };

  const cancelEditingNotes = () => {
    setEditingNotes(null);
    setCurrentNotes('');
  };

  const handleReflectionEdit = (stepNumber: number, question: string, value: string) => {
    const key = `${stepNumber}-${question}`;
    setEditingReflections(prev => ({ ...prev, [key]: value }));
  };

  const saveReflection = async (stepNumber: number, question: string) => {
    const key = `${stepNumber}-${question}`;
    const value = editingReflections[key];
    if (value === undefined) return;

    const current = getStepProgress(stepNumber);
    const newAnswers = {
      ...current.reflectionAnswers,
      [question]: value,
    };
    await storage.updateStepProgress(stepNumber, { reflectionAnswers: newAnswers });
    await loadStepProgress();
    
    // Remove from editing
    setEditingReflections(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const cancelReflectionEdit = (key: string) => {
    setEditingReflections(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const completedCount = stepProgress.filter(s => s.completed).length;

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-6 border-b border-slate-200">
        <h2 className="text-2xl font-semibold text-black mb-2">Twelve-Step Workbook</h2>
        <p className="text-base text-slate-600 leading-relaxed mb-4">
          Your personal guide through the 12 Steps of recovery. Each step includes modern context, 
          trauma-informed reflection, deep questions, and Joseph Murphy's subconscious mind practices.
        </p>
        
        {/* How Everything Works Together */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">How Everything Works Together</h3>
          <div className="space-y-2 text-xs text-blue-800 leading-relaxed">
            <p>
              <strong>📖 Workbook (this section):</strong> Deep dive into each step with meditations, reflection questions, and daily practices. Work at your own pace.
            </p>
            <p>
              <strong>📅 Weekly Plan:</strong> Structured 12-week journey that references techniques from the Workbook. Use the daily practices, affirmations, and grounding exercises throughout your week.
            </p>
            <p>
              <strong>✍️ Journal:</strong> Free-form space to process, reflect, and document your expressive arts work or any insights that arise.
            </p>
            <p className="italic mt-2">
              All approaches are trauma-informed and designed to work together. You can use them separately or combine them—whatever supports your healing journey.
            </p>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Your Progress</span>
            <span className="text-base font-medium text-black">{completedCount} of 12</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-500"
              style={{ width: `${(completedCount / 12) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div>
        {steps.map((step) => {
          const progress = getStepProgress(step.number);
          return (
            <div key={step.number} className="border-b border-slate-200">
              {/* Step Header */}
              <button
                onClick={() => toggleStep(step.number)}
                className="w-full px-4 py-4 flex items-center justify-between active:bg-slate-50"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
                    progress.completed
                      ? 'bg-blue-600'
                      : 'border-2 border-slate-300'
                  }`}>
                    {progress.completed ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-base text-slate-600">{step.number}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-black mb-1">Step {step.number}</h3>
                    <p className="text-sm text-slate-600 truncate">{step.title}</p>
                  </div>
                </div>
                {expandedStep === step.number ? (
                  <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>
              
              {/* Complete Button */}
              <div className="px-4 pb-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStepComplete(step.number);
                  }}
                  className="text-sm text-blue-600 active:opacity-50"
                >
                  {progress.completed ? 'Mark as incomplete' : 'Mark as complete'}
                </button>
              </div>

              {/* Expanded Content */}
              {expandedStep === step.number && (
                <div className="px-4 py-4 space-y-6 bg-slate-50">
                  {/* Personal Notes Section */}
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-base font-medium text-black">Personal Notes</h4>
                      {editingNotes !== step.number && (
                        <button
                          onClick={() => startEditingNotes(step.number)}
                          className="text-sm text-blue-600 active:opacity-50"
                        >
                          {progress.notes ? 'Edit' : 'Add'}
                        </button>
                      )}
                    </div>
                    
                    {editingNotes === step.number ? (
                      <div className="space-y-3">
                        <textarea
                          value={currentNotes}
                          onChange={(e) => setCurrentNotes(e.target.value)}
                          placeholder="Write your personal reflections, insights, or goals for this step..."
                          className="w-full min-h-[120px] px-3 py-3 border-b border-slate-300 text-base text-black focus:outline-none focus:border-blue-600 resize-y bg-white"
                          style={{ fontSize: '16px' }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveNotes(step.number)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg active:opacity-80 text-sm font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditingNotes}
                            className="px-4 py-2 text-slate-600 active:opacity-50 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : progress.notes ? (
                      <p className="text-base text-black whitespace-pre-wrap leading-relaxed">{progress.notes}</p>
                    ) : (
                      <p className="text-sm text-slate-500">No notes yet.</p>
                    )}
                  </div>

                  {/* Modern Overview */}
                  <div>
                    <h4 className="text-base font-medium text-black mb-2">Overview</h4>
                    <p className="text-base text-slate-600 leading-relaxed">{step.overview}</p>
                  </div>

                {/* Core Principle */}
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <h4 className="text-base font-medium text-black mb-2">Core Principle</h4>
                  <p className="text-base text-slate-600">{step.corePrinciple}</p>
                </div>

                {/* Trauma-Informed Reflection */}
                <div>
                  <h4 className="text-base font-medium text-black mb-2">Trauma-Informed Reflection</h4>
                  <p className="text-base text-slate-600 leading-relaxed">{step.traumaInformed}</p>
                </div>

                {/* Meditation */}
                {step.meditation && (
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-base font-medium text-black">{step.meditation.title}</h4>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">From Workbook</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3 italic">This meditation complements the Joseph Murphy practices below. Use whichever approach resonates with you, or combine them.</p>
                    <div className="space-y-3">
                      {step.meditation.instructions.map((instruction, idx) => (
                        <div key={idx} className="flex gap-3">
                          <span className="text-blue-600 font-medium shrink-0">{idx + 1}.</span>
                          <p className="text-base text-slate-700 leading-relaxed">{instruction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Language Modification */}
                {step.languageModification && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="text-base font-medium text-blue-900 mb-2">Language Modification Guidance</h4>
                    <p className="text-sm text-blue-800 leading-relaxed mb-2">{step.languageModification}</p>
                    <p className="text-xs text-blue-700 italic mt-2">
                      Remember: You have complete permission to modify language to fit your experience. This is trauma-informed recovery—flexibility and self-compassion are essential.
                    </p>
                  </div>
                )}

                {/* Expressive Arts Prompt */}
                {step.expressiveArtsPrompt && (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h4 className="text-base font-medium text-purple-900 mb-2">Expressive Arts Option</h4>
                    <p className="text-sm text-purple-800 leading-relaxed mb-2">{step.expressiveArtsPrompt}</p>
                    <p className="text-xs text-purple-700 italic mt-2">
                      You can use your Journal section to document your expressive work, or keep it in a separate notebook. There's no right or wrong way to express yourself.
                    </p>
                  </div>
                )}

                {/* Reflection Questions */}
                <div>
                  <h4 className="text-base font-medium text-black mb-3">Reflection Questions</h4>
                  <div className="space-y-6">
                    {step.reflectionQuestions.map((question, idx) => {
                      const key = `${step.number}-${question}`;
                      const savedAnswer = progress.reflectionAnswers?.[question] || '';
                      const isEditing = key in editingReflections;
                      const displayValue = isEditing ? editingReflections[key] : savedAnswer;
                      
                      return (
                        <div key={idx} className="bg-white rounded-lg p-4 border border-slate-200">
                          <p className="text-base font-medium text-black mb-3 leading-relaxed">{question}</p>
                          
                          {!isEditing && savedAnswer ? (
                            <div>
                              <p className="text-base text-black whitespace-pre-wrap leading-relaxed mb-3">{savedAnswer}</p>
                              <button
                                onClick={() => handleReflectionEdit(step.number, question, savedAnswer)}
                                className="text-sm text-blue-600 active:opacity-50"
                              >
                                Edit
                              </button>
                            </div>
                          ) : (
                            <div>
                              <textarea
                                value={displayValue}
                                onChange={(e) => handleReflectionEdit(step.number, question, e.target.value)}
                                placeholder="Write your reflection here..."
                                className="w-full min-h-[120px] px-3 py-3 border-b border-slate-300 text-base text-black placeholder-slate-400 focus:outline-none focus:border-blue-600 resize-y bg-white mb-3"
                                style={{ fontSize: '16px' }}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveReflection(step.number, question)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg active:opacity-80 text-sm font-medium"
                                >
                                  Save
                                </button>
                                {savedAnswer && (
                                  <button
                                    onClick={() => cancelReflectionEdit(key)}
                                    className="px-4 py-2 text-slate-600 active:opacity-50 text-sm"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Joseph Murphy Practices */}
                <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-base font-medium text-black">Joseph Murphy Practices</h4>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Daily Tools</span>
                  </div>
                  <p className="text-sm text-slate-600 italic mb-4">These practices are designed to be used daily throughout your week. They work alongside the meditation above and support your trauma-informed recovery journey.</p>

                  <div>
                    <h5 className="text-sm font-medium text-black mb-2">Daily Affirmations</h5>
                    <ul className="space-y-2">
                      {step.murphyPractices.affirmations.map((affirmation, idx) => (
                        <li key={idx} className="text-base text-slate-600 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-slate-400">
                          {affirmation}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-black mb-2">Lullaby Technique</h5>
                    <p className="text-base text-slate-600 leading-relaxed">{step.murphyPractices.lullaby}</p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-black mb-2">Visualization</h5>
                    <p className="text-base text-slate-600 leading-relaxed">{step.murphyPractices.visualization}</p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-black mb-2">Revision</h5>
                    <p className="text-base text-slate-600 leading-relaxed">{step.murphyPractices.revision}</p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-black mb-2">Mental Diet</h5>
                    <p className="text-base text-slate-600 leading-relaxed">{step.murphyPractices.mentalDiet}</p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-black mb-2">Self-Concept Work</h5>
                    <p className="text-base text-slate-600 leading-relaxed">{step.murphyPractices.selfConcept}</p>
                  </div>
                </div>

                {/* Mini Summary */}
                <div className="bg-white rounded-lg p-4 border-l-4 border-blue-600">
                  <h4 className="text-base font-medium text-black mb-2">What Truth Am I Carrying Forward?</h4>
                  <p className="text-base text-slate-600 leading-relaxed mb-2">{step.miniSummary}</p>
                  <p className="text-xs text-slate-500 italic mt-2">
                    This truth can guide you through your Weekly Plan practices and daily life. Return to it whenever you need grounding or clarity.
                  </p>
                </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
