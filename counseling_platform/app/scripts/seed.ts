import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Cultural Stories Data
const culturalStories = [
  {
    title: "The Clever Rabbit and the Lion",
    source: "PANCHTANTRA" as const,
    summary: "A small rabbit uses wit to defeat a mighty lion, teaching that intelligence triumphs over brute force.",
    fullStory: "In a dense forest lived a powerful lion who terrorized all animals. Every day, one animal had to sacrifice itself to feed the lion. When it was the rabbit's turn, he came up with a clever plan. He told the lion about another lion who lived in a well and challenged his authority. The proud lion went to fight this 'rival' and saw his own reflection in the water. He jumped in to attack and drowned. The clever rabbit saved all the forest animals through wit and courage.",
    themes: ["Intelligence over strength", "Courage", "Problem-solving", "Leadership"],
    applicableFor: ["Ages 8-16", "Self-confidence issues", "Bullying situations", "Problem-solving skills"],
    moralLessons: ["Brain is mightier than brawn", "Even the smallest can make a difference", "Clever thinking can solve big problems"],
    tags: ["wisdom", "courage", "intelligence", "problem-solving"]
  },
  {
    title: "Shravan Kumar's Devotion",
    source: "RAMAYANA" as const,
    summary: "A devoted son carries his blind parents on pilgrimage, demonstrating the ultimate respect for elders.",
    fullStory: "Shravan Kumar was a devoted son whose parents were old and blind. Despite their condition, they wished to go on a pilgrimage. Shravan created a special basket and carried his parents on his shoulders to various holy places. His dedication and love for his parents became legendary. Though his story ends tragically when King Dasharatha accidentally kills him, his devotion to his parents remains an eternal example of filial piety.",
    themes: ["Respect for parents", "Duty", "Sacrifice", "Love"],
    applicableFor: ["Family conflicts", "Respect for elders", "Understanding responsibilities"],
    moralLessons: ["Honor your parents", "Family comes first", "Sacrifice for loved ones"],
    tags: ["family", "respect", "duty", "love"]
  },
  {
    title: "The Monkey and the Crocodile",
    source: "PANCHTANTRA" as const,
    summary: "A monkey outwits a crocodile who tries to betray their friendship, teaching about trust and quick thinking.",
    fullStory: "A monkey lived on a tree by a river and befriended a crocodile. They would share fruits and stories daily. The crocodile's wife, jealous of this friendship, demanded her husband bring the monkey's heart for her to eat. The crocodile reluctantly agreed and invited the monkey for dinner. Midway across the river, he revealed his true intention. The clever monkey said he left his heart on the tree and needed to go back to get it. Once back on the tree, the monkey refused to come down, teaching the crocodile about the value of true friendship.",
    themes: ["Friendship", "Trust", "Betrayal", "Quick thinking"],
    applicableFor: ["Friendship issues", "Trust problems", "Peer pressure"],
    moralLessons: ["Choose friends wisely", "Think before you act", "True friendship doesn't hurt"],
    tags: ["friendship", "trust", "wisdom", "betrayal"]
  },
  {
    title: "Arjuna's Focus",
    source: "MAHABHARATA" as const,
    summary: "Prince Arjuna's unwavering focus on his target teaches the power of concentration and dedication.",
    fullStory: "During archery training, Guru Dronacharya placed a wooden bird on a tree and asked his students what they could see. Some said the tree, others the branches or leaves. When asked, Arjuna said he could only see the bird's eye. When further questioned about the head, body, or tree, Arjuna maintained he could see only the eye. Pleased with his focus, Dronacharya asked him to shoot. Arjuna's arrow hit the bird's eye perfectly. This demonstrated the power of complete concentration and single-minded focus.",
    themes: ["Focus", "Concentration", "Goal-setting", "Excellence"],
    applicableFor: ["Academic struggles", "Lack of focus", "Goal achievement"],
    moralLessons: ["Focus leads to success", "Eliminate distractions", "See only your goal"],
    tags: ["focus", "concentration", "goals", "excellence"]
  },
  {
    title: "The Persistent Crow",
    source: "PANCHTANTRA" as const,
    summary: "A thirsty crow finds water in a narrow pot and uses stones to raise the water level, showing persistence and innovation.",
    fullStory: "A crow was extremely thirsty on a hot summer day. It found a pot with a little water at the bottom, but the neck was too narrow for the crow to reach the water. Instead of giving up, the crow looked around and found small stones. One by one, it dropped stones into the pot. As more stones were added, the water level rose higher and higher until finally, the crow could drink the water. The crow's persistence and clever thinking saved its life.",
    themes: ["Persistence", "Innovation", "Problem-solving", "Never give up"],
    applicableFor: ["Academic challenges", "Goal achievement", "Creative thinking"],
    moralLessons: ["Hard work pays off", "Think creatively", "Never give up easily"],
    tags: ["persistence", "creativity", "problem-solving", "determination"]
  },
  {
    title: "Hanuman's Courage",
    source: "RAMAYANA" as const,
    summary: "Hanuman leaps across the ocean to find Sita, showing that faith and courage can overcome any obstacle.",
    fullStory: "When the monkey army needed to cross the vast ocean to reach Lanka and rescue Sita, everyone was worried about the impossible task. Hanuman, initially unaware of his own powers, was reminded of his divine strength by Jambavan. With complete faith in Lord Rama and courage in his heart, Hanuman took a mighty leap and flew across the ocean. His unwavering devotion and self-belief enabled him to accomplish what seemed impossible.",
    themes: ["Faith", "Courage", "Self-belief", "Devotion"],
    applicableFor: ["Low self-confidence", "Fear of challenges", "Spiritual growth"],
    moralLessons: ["Believe in yourself", "Faith gives strength", "Nothing is impossible with dedication"],
    tags: ["courage", "faith", "self-belief", "devotion"]
  },
  {
    title: "The Honest Woodcutter",
    source: "PANCHTANTRA" as const,
    summary: "A poor woodcutter's honesty is rewarded when he refuses to claim golden and silver axes that aren't his.",
    fullStory: "A poor woodcutter was cutting wood near a river when his iron axe fell into the deep water. He sat by the riverbank and wept for his livelihood was gone. The river god appeared and offered to help. He brought up a golden axe first, then a silver one, but the honest woodcutter said neither was his. Finally, the god brought up the iron axe, which the woodcutter gladly claimed. Impressed by his honesty, the god gave him all three axes as a reward.",
    themes: ["Honesty", "Integrity", "Contentment", "Reward for virtue"],
    applicableFor: ["Moral development", "Character building", "Temptation resistance"],
    moralLessons: ["Honesty is the best policy", "Good deeds are rewarded", "Be content with what you have"],
    tags: ["honesty", "integrity", "virtue", "contentment"]
  },
  {
    title: "The United We Stand",
    source: "PANCHTANTRA" as const,
    summary: "A bundle of sticks teaches the importance of unity and working together for strength.",
    fullStory: "An old farmer had four sons who constantly fought with each other. Worried about their future, he decided to teach them a lesson. He gave each son a single stick and asked them to break it, which they did easily. Then he gave them a bundle of sticks tied together and asked them to break it. Despite their best efforts, none could break the bundle. The farmer explained that individually they were weak, but together they were strong, just like the sticks.",
    themes: ["Unity", "Teamwork", "Family bonds", "Strength in numbers"],
    applicableFor: ["Sibling conflicts", "Team building", "Social cooperation"],
    moralLessons: ["United we stand, divided we fall", "Family should stick together", "Teamwork makes everything possible"],
    tags: ["unity", "teamwork", "family", "cooperation"]
  },
  {
    title: "The Tortoise and the Hare",
    source: "PANCHTANTRA" as const,
    summary: "A slow but steady tortoise wins a race against a fast but overconfident hare.",
    fullStory: "A hare was always boasting about how fast he could run and made fun of a tortoise for being slow. The tortoise challenged the hare to a race. The hare quickly ran ahead and, confident of winning, decided to take a nap midway. Meanwhile, the tortoise kept moving slowly but steadily. When the hare woke up, he found the tortoise had already crossed the finish line. The tortoise won through consistent effort while the hare lost due to overconfidence.",
    themes: ["Persistence", "Humility", "Consistent effort", "Overconfidence dangers"],
    applicableFor: ["Academic improvement", "Goal achievement", "Building good habits"],
    moralLessons: ["Slow and steady wins the race", "Don't be overconfident", "Consistency is key"],
    tags: ["persistence", "consistency", "humility", "determination"]
  },
  {
    title: "Krishna and the Butter",
    source: "BHAGAVAD_GITA" as const,
    summary: "Young Krishna's mischievous acts teach about innocent joy and the importance of not being too serious.",
    fullStory: "Young Krishna loved butter and would often steal it from his mother Yashoda and the neighbors. He would climb on his friends' shoulders to reach high pots, break them, and share the butter with his friends and monkeys. When the village women complained to Yashoda, she would tie Krishna to a heavy grinding stone as punishment. But Krishna would drag the stone between two trees, uproot them, and free himself. His innocent mischief brought joy to everyone and taught that life should have moments of pure, innocent fun.",
    themes: ["Innocent joy", "Childhood freedom", "Sharing", "Life balance"],
    applicableFor: ["Overly serious children", "Social sharing", "Childhood development"],
    moralLessons: ["Enjoy innocent pleasures", "Share with others", "Balance work with play"],
    tags: ["joy", "innocence", "sharing", "childhood"]
  },
  {
    title: "The Wise King Vikram",
    source: "OTHER" as const,
    summary: "King Vikramaditya's dedication to justice, even at personal cost, exemplifies true leadership.",
    fullStory: "King Vikramaditya was known for his justice and wisdom. One night, a poor woman came to his palace seeking justice for her son who was killed by a rich merchant's careless chariot driving. The merchant offered gold to settle the matter, but Vikram refused. He investigated personally and when the merchant was found guilty, he faced the same punishment regardless of his wealth. The king's commitment to equal justice for rich and poor alike made his kingdom prosperous and peaceful.",
    themes: ["Justice", "Equality", "Leadership", "Moral courage"],
    applicableFor: ["Leadership development", "Moral reasoning", "Social justice understanding"],
    moralLessons: ["Justice should be equal for all", "True leaders protect the weak", "Wealth cannot buy justice"],
    tags: ["justice", "equality", "leadership", "courage"]
  },
  {
    title: "The Grateful Mongoose",
    source: "PANCHTANTRA" as const,
    summary: "A mongoose saves a baby from a snake but is misunderstood, teaching about hasty judgments.",
    fullStory: "A farmer had a pet mongoose that he loved like family. One day, he left his baby with the mongoose and went to the market. A snake entered the house and threatened the baby. The loyal mongoose fought bravely and killed the snake to protect the child. When the farmer returned and saw the mongoose with blood on its mouth, he assumed it had harmed his baby and killed the mongoose in anger. Only then did he see the dead snake and realize his terrible mistake. His hasty judgment cost him his faithful friend.",
    themes: ["Loyalty", "Hasty judgment", "Trust", "Consequences"],
    applicableFor: ["Trust issues", "Quick anger management", "Understanding loyalty"],
    moralLessons: ["Don't judge quickly", "Loyal friends deserve trust", "Think before you act"],
    tags: ["loyalty", "trust", "judgment", "friendship"]
  },
  {
    title: "Birbal's Wisdom",
    source: "AKBAR_BIRBAL" as const,
    summary: "Birbal's clever solution to find the most beautiful child shows the power of wise thinking.",
    fullStory: "Emperor Akbar once asked Birbal to find the most beautiful child in the kingdom. Birbal accepted the challenge and returned the next day saying he had found the child. When Akbar asked to see this child, Birbal brought his own ordinary-looking son. Akbar was puzzled and asked how this could be the most beautiful child. Birbal replied, 'Your Majesty, to every parent, their own child is the most beautiful in the world. Beauty lies in the eyes of the beholder, especially a parent's loving eyes.' Akbar was impressed by this wisdom.",
    themes: ["Wisdom", "Perspective", "Parental love", "Beauty definition"],
    applicableFor: ["Self-esteem issues", "Understanding different perspectives", "Parent-child relationships"],
    moralLessons: ["Everyone is beautiful in someone's eyes", "Love changes how we see things", "Wisdom is more valuable than appearance"],
    tags: ["wisdom", "perspective", "love", "beauty"]
  },
  {
    title: "The Dancing Peacock",
    source: "PANCHTANTRA" as const,
    summary: "A peacock learns that showing off without substance leads to embarrassment.",
    fullStory: "A beautiful peacock was very proud of its colorful feathers and would dance and show off in front of other birds. The peacock mocked a simple crow for its black feathers. One day, during a heavy storm, all birds sought shelter. The peacock's beautiful feathers became heavy with water and it couldn't fly to safety. The simple crow, with its practical feathers, helped rescue the peacock. The peacock learned that true beauty lies in being helpful and kind, not just in appearance.",
    themes: ["Humility", "Inner beauty", "Kindness", "Pride dangers"],
    applicableFor: ["Pride and ego issues", "Bullying behavior", "Understanding true beauty"],
    moralLessons: ["Don't judge by appearance", "Kindness is true beauty", "Pride comes before a fall"],
    tags: ["humility", "kindness", "beauty", "pride"]
  },
  {
    title: "The Golden Goose",
    source: "PANCHTANTRA" as const,
    summary: "Greed destroys a wonderful blessing when a couple kills their golden egg-laying goose.",
    fullStory: "A poor farmer found a goose that laid one golden egg every day. The farmer and his wife became rich selling these eggs. But as time passed, they became greedy and impatient. They thought if they cut open the goose, they could get all the golden eggs at once and become instantly wealthy. They killed the goose, but found nothing inside except what any normal goose would have. Their greed had destroyed their source of steady wealth, and they returned to poverty.",
    themes: ["Greed consequences", "Patience", "Contentment", "Destroying blessings"],
    applicableFor: ["Greed and materialism", "Patience development", "Appreciating what you have"],
    moralLessons: ["Greed destroys good things", "Be patient and grateful", "Don't destroy what sustains you"],
    tags: ["greed", "patience", "contentment", "consequences"]
  },
  {
    title: "The Elephant and the Mice",
    source: "PANCHTANTRA" as const,
    summary: "Small mice save mighty elephants, proving that size doesn't determine the ability to help.",
    fullStory: "A group of elephants regularly walked through a village where many mice lived, accidentally crushing their homes and families. The mice approached the elephant leader and requested a different path, promising to help the elephants someday if needed. The elephants laughed but agreed to change their route. Later, when hunters trapped the elephants in nets, the grateful mice came to their rescue. They gnawed through the ropes all night and freed the mighty elephants. The elephants learned never to underestimate anyone based on size.",
    themes: ["Mutual help", "Don't underestimate others", "Kindness repaid", "Size doesn't matter"],
    applicableFor: ["Respecting others regardless of status", "Understanding reciprocal help", "Building community"],
    moralLessons: ["Everyone can help in some way", "Kindness comes back to you", "Don't judge by size or status"],
    tags: ["mutual-help", "respect", "kindness", "community"]
  },
  {
    title: "Ganesha's Wisdom Contest",
    source: "OTHER" as const,
    summary: "Ganesha wins a contest against his brother by understanding the true meaning of 'going around the world'.",
    fullStory: "Lord Shiva announced a contest between his sons Ganesha and Kartikeya - whoever could go around the world three times first would get a special fruit. Kartikeya immediately set off on his peacock to circle the earth. Ganesha, being heavy and having a mouse as his vehicle, thought differently. He simply walked around his parents Shiva and Parvati three times and claimed victory. When asked to explain, Ganesha said, 'My parents are my whole world. Going around them is like going around the entire universe.' His wisdom and devotion won him the contest.",
    themes: ["Wisdom over speed", "Family devotion", "Creative thinking", "Understanding deeper meaning"],
    applicableFor: ["Family relationships", "Creative problem solving", "Understanding priorities"],
    moralLessons: ["Think creatively", "Family is your world", "Wisdom beats speed"],
    tags: ["wisdom", "family", "creativity", "devotion"]
  },
  {
    title: "The Learned Fool",
    source: "PANCHTANTRA" as const,
    summary: "A man with book knowledge but no practical wisdom faces troubles, showing the importance of applied intelligence.",
    fullStory: "Four friends went to study in a distant city. Three became very learned from books but had no practical sense. The fourth was not as scholarly but had common sense. On their way home, they found bones of a dead lion. The three scholars decided to show their learning by bringing the lion back to life using their knowledge. Despite the fourth friend's warnings about the danger, they proceeded. When the lion came to life, it killed the three learned fools and ran away. The practical friend, who had climbed a tree, survived.",
    themes: ["Practical wisdom", "Common sense", "Knowledge application", "Pride in learning"],
    applicableFor: ["Academic vs practical learning", "Common sense development", "Balancing study with life skills"],
    moralLessons: ["Practical wisdom is important", "Book knowledge needs common sense", "Think of consequences"],
    tags: ["wisdom", "common-sense", "knowledge", "practical-learning"]
  },
  {
    title: "The Faithful Dog",
    source: "PANCHTANTRA" as const,
    summary: "A loyal dog's devotion to its master teaches about unconditional love and faithfulness.",
    fullStory: "A poor man had only a faithful dog as his companion. When the man fell seriously ill and couldn't work, the dog would go to the market daily and bring food by doing tricks for people. When the man died, the dog stayed by his grave, refusing all offers of new homes and food from kind villagers. The dog's loyalty moved everyone in the village. They built a small temple at the spot to honor such devotion. The dog's faithfulness became legendary, teaching people about unconditional love.",
    themes: ["Loyalty", "Unconditional love", "Faithfulness", "Devotion"],
    applicableFor: ["Understanding loyalty", "Pet relationships", "Faithful friendships"],
    moralLessons: ["True loyalty never wavers", "Love doesn't expect rewards", "Faithfulness is precious"],
    tags: ["loyalty", "love", "faithfulness", "devotion"]
  },
  {
    title: "The Magic Pot",
    source: "PANCHTANTRA" as const,
    summary: "A poor woman's honesty and kindness with a magic pot teaches about using blessings wisely.",
    fullStory: "A poor old woman found a magic pot that would double whatever was put into it. Instead of keeping it secret, she shared food with all her hungry neighbors. When a greedy rich man heard about the pot, he stole it and filled it with gold coins. But when he fell into the pot accidentally, it created another evil version of himself. The two greedy men fought constantly and destroyed each other. The pot returned to the kind woman, who continued helping others. Her generous heart made the magic truly beneficial.",
    themes: ["Generosity", "Wise use of blessings", "Greed punishment", "Sharing good fortune"],
    applicableFor: ["Sharing and generosity", "Using talents wisely", "Community service"],
    moralLessons: ["Share your blessings", "Generosity brings happiness", "Greed destroys itself"],
    tags: ["generosity", "sharing", "wisdom", "community"]
  }
];

// Child profiles with comprehensive data
const childProfiles = [
  {
    name: "Aarav Patel",
    age: 14,
    gender: "MALE" as const,
    state: "Gujarat",
    district: "Ahmedabad",
    background: "Single mother, works as domestic help",
    schoolLevel: "Class 9",
    interests: ["Cricket", "Mathematics", "Mobile phones"],
    challenges: ["Financial pressure to work", "Lack of study space"],
    language: "Gujarati"
  },
  {
    name: "Priya Sharma",
    age: 16,
    gender: "FEMALE" as const,
    state: "Rajasthan",
    district: "Jaipur",
    background: "Large family, father is a rickshaw driver",
    schoolLevel: "Class 11",
    interests: ["Dancing", "Teaching younger children", "Art"],
    challenges: ["Family pressure for early marriage", "Gender discrimination"],
    language: "Hindi"
  },
  {
    name: "Arjun Singh",
    age: 13,
    gender: "MALE" as const,
    state: "Punjab",
    district: "Ludhiana",
    background: "Farming family affected by debt",
    schoolLevel: "Class 8",
    interests: ["Agriculture", "Tractors", "Helping father"],
    challenges: ["Irregular school attendance", "Economic stress"],
    language: "Punjabi"
  },
  {
    name: "Kavya Reddy",
    age: 15,
    gender: "FEMALE" as const,
    state: "Telangana",
    district: "Hyderabad",
    background: "Parents work in IT but struggle with expenses",
    schoolLevel: "Class 10",
    interests: ["Computer programming", "Science fiction", "Robotics"],
    challenges: ["High academic pressure", "Social anxiety"],
    language: "Telugu"
  },
  {
    name: "Rohit Kumar",
    age: 12,
    gender: "MALE" as const,
    state: "Bihar",
    district: "Patna",
    background: "Father is a daily wage laborer, mother is housewife",
    schoolLevel: "Class 7",
    interests: ["Football", "Stories", "Drawing"],
    challenges: ["Malnutrition", "Irregular meals affecting concentration"],
    language: "Hindi"
  },
  {
    name: "Sneha Nair",
    age: 17,
    gender: "FEMALE" as const,
    state: "Kerala",
    district: "Kochi",
    background: "Lives with grandmother, parents work in Gulf",
    schoolLevel: "Class 12",
    interests: ["Classical music", "Literature", "Social work"],
    challenges: ["Loneliness", "Pressure to excel for foreign education"],
    language: "Malayalam"
  },
  {
    name: "Vikram Yadav",
    age: 11,
    gender: "MALE" as const,
    state: "Uttar Pradesh",
    district: "Varanasi",
    background: "Father is a boat operator on Ganges",
    schoolLevel: "Class 6",
    interests: ["Swimming", "River ecology", "Helping tourists"],
    challenges: ["Water-borne diseases", "Seasonal income variation"],
    language: "Hindi"
  },
  {
    name: "Anita Devi",
    age: 16,
    gender: "FEMALE" as const,
    state: "West Bengal",
    district: "Kolkata",
    background: "Lives in slum, mother works in garment factory",
    schoolLevel: "Class 11",
    interests: ["Fashion design", "Singing", "Community organizing"],
    challenges: ["Poor living conditions", "Safety concerns"],
    language: "Bengali"
  },
  {
    name: "Dev Patel",
    age: 14,
    gender: "MALE" as const,
    state: "Maharashtra",
    district: "Mumbai",
    background: "Father is a taxi driver, lives in 1-room apartment",
    schoolLevel: "Class 9",
    interests: ["Movies", "Acting", "Photography"],
    challenges: ["Space constraints", "Noise pollution affecting studies"],
    language: "Marathi"
  },
  {
    name: "Ritu Kumari",
    age: 13,
    gender: "FEMALE" as const,
    state: "Jharkhand",
    district: "Ranchi",
    background: "Tribal family, father works in mines",
    schoolLevel: "Class 8",
    interests: ["Traditional crafts", "Nature", "Tribal stories"],
    challenges: ["Cultural preservation vs modern education", "Health issues from mining area"],
    language: "Hindi"
  },
  {
    name: "Kiran Joshi",
    age: 15,
    gender: "MALE" as const,
    state: "Uttarakhand",
    district: "Dehradun",
    background: "Mountain village, parents work in tourism",
    schoolLevel: "Class 10",
    interests: ["Trekking", "Environmental conservation", "Photography"],
    challenges: ["Seasonal unemployment of parents", "Limited internet connectivity"],
    language: "Hindi"
  },
  {
    name: "Meera Das",
    age: 12,
    gender: "FEMALE" as const,
    state: "Odisha",
    district: "Bhubaneswar",
    background: "Father is a fisherman, affected by cyclones",
    schoolLevel: "Class 7",
    interests: ["Marine life", "Crafts", "Helping mother"],
    challenges: ["Climate change affecting family income", "Early responsibility burden"],
    language: "Odia"
  },
  {
    name: "Akash Choudhary",
    age: 16,
    gender: "MALE" as const,
    state: "Haryana",
    district: "Gurgaon",
    background: "Father works as security guard in corporate office",
    schoolLevel: "Class 11",
    interests: ["Physical fitness", "Martial arts", "Discipline"],
    challenges: ["Peer pressure from affluent classmates", "Economic disparity stress"],
    language: "Hindi"
  },
  {
    name: "Lakshmi Pillai",
    age: 14,
    gender: "FEMALE" as const,
    state: "Tamil Nadu",
    district: "Chennai",
    background: "Lives with aunt, parents work in textile industry",
    schoolLevel: "Class 9",
    interests: ["Classical dance", "Mathematics", "Helping others"],
    challenges: ["Missing parents", "Balancing tradition with modernity"],
    language: "Tamil"
  },
  {
    name: "Suresh Gowda",
    age: 13,
    gender: "MALE" as const,
    state: "Karnataka",
    district: "Bangalore",
    background: "Lives in urban slum, father drives auto-rickshaw",
    schoolLevel: "Class 8",
    interests: ["Technology", "Video games", "Programming"],
    challenges: ["Limited technology access", "Peer pressure"],
    language: "Kannada"
  }
];

// User accounts data with approval status
const userData = [
  {
    email: "admin@counseling.org",
    name: "Dr. Anita Sharma",
    password: "admin123",
    role: "ADMIN" as const,
    state: "Delhi",
    phone: "+91-9876543210",
    specialization: "Clinical Psychology",
    approvalStatus: "APPROVED" as const,
    experience: "15 years in clinical psychology and child counseling",
    motivation: "Dedicated to improving mental health access for underprivileged children"
  },
  {
    email: "john@doe.com",
    name: "John Doe",
    password: "johndoe123",
    role: "ADMIN" as const,
    state: "Maharashtra",
    phone: "+91-9876543211",
    specialization: "Psychology and Career Guidance",
    approvalStatus: "APPROVED" as const,
    experience: "10 years in educational psychology",
    motivation: "Passionate about providing equal opportunities through guidance"
  },
  {
    email: "priya.volunteer@gmail.com",
    name: "Priya Mehta",
    password: "volunteer123",
    role: "VOLUNTEER" as const,
    state: "Gujarat",
    phone: "+91-9876543212",
    specialization: "Child Psychology",
    approvalStatus: "APPROVED" as const,
    experience: "5 years working with children in NGOs",
    motivation: "Want to help children overcome psychological barriers to education"
  },
  {
    email: "rajesh.counselor@gmail.com",
    name: "Rajesh Kumar",
    password: "volunteer123",
    role: "VOLUNTEER" as const,
    state: "Punjab",
    phone: "+91-9876543213",
    specialization: "Career Guidance",
    approvalStatus: "APPROVED" as const,
    experience: "8 years in career counseling and placement",
    motivation: "Believe every child deserves to know their potential career paths"
  },
  {
    email: "sneha.support@gmail.com",
    name: "Sneha Patel",
    password: "volunteer123",
    role: "VOLUNTEER" as const,
    state: "Rajasthan",
    phone: "+91-9876543214",
    specialization: "Emotional Support",
    approvalStatus: "APPROVED" as const,
    experience: "3 years in community social work",
    motivation: "Experienced emotional trauma myself, want to help others heal"
  },
  {
    email: "amit.mentor@gmail.com",
    name: "Amit Singh",
    password: "volunteer123",
    role: "VOLUNTEER" as const,
    state: "Uttar Pradesh",
    phone: "+91-9876543215",
    specialization: "Academic Support",
    approvalStatus: "APPROVED" as const,
    experience: "6 years teaching in rural schools",
    motivation: "Passionate about bridging educational gaps in rural areas"
  },
  // Pending approval users for testing
  {
    email: "ravi.pending@gmail.com",
    name: "Ravi Sharma",
    password: "volunteer123",
    role: "VOLUNTEER" as const,
    state: "Bihar",
    phone: "+91-9876543216",
    specialization: "Mathematics Tutoring",
    approvalStatus: "PENDING" as const,
    experience: "2 years tutoring students",
    motivation: "Want to help children excel in mathematics and science"
  },
  {
    email: "kavya.new@gmail.com",
    name: "Kavya Reddy",
    password: "volunteer123",
    role: "VOLUNTEER" as const,
    state: "Telangana",
    phone: "+91-9876543217",
    specialization: "Art Therapy",
    approvalStatus: "PENDING" as const,
    experience: "Fresh graduate in psychology",
    motivation: "Believe in healing through creative expression"
  },
  {
    email: "rejected.user@gmail.com",
    name: "Test Rejected",
    password: "volunteer123",
    role: "VOLUNTEER" as const,
    state: "Karnataka",
    phone: "+91-9876543218",
    specialization: "General Support",
    approvalStatus: "REJECTED" as const,
    rejectionReason: "Insufficient experience and unclear motivation",
    experience: "No formal experience",
    motivation: "Just want to help"
  }
];

// Enhanced knowledge base entries with more comprehensive content
const knowledgeBaseEntries = [
  {
    title: "Career Guidance Framework for Rural Children",
    content: "A comprehensive guide for counseling children from rural backgrounds about career opportunities. This framework covers traditional careers, new age opportunities, skill development programs, and scholarship information. It includes practical advice on overcoming geographical and economic barriers to career advancement. The guide emphasizes leveraging local resources, understanding government schemes, and building networks for career growth. It also addresses the unique challenges faced by rural children such as limited exposure to diverse career options, lack of mentorship, and financial constraints.",
    summary: "Framework for career counseling in rural contexts",
    category: "CAREER_GUIDANCE" as const,
    subCategory: "Rural Development",
    fileType: "pdf",
    fileSize: 2048576,
    isProcessed: true
  },
  {
    title: "Emotional Resilience Building Techniques",
    content: "Evidence-based techniques for helping children build emotional resilience. This comprehensive resource includes mindfulness exercises, coping strategies, and stress management techniques adapted for the Indian cultural context. The content covers age-appropriate interventions, family involvement strategies, and community-based support systems. Special attention is given to trauma-informed approaches and culturally sensitive practices. The guide includes practical exercises, case studies, and assessment tools for measuring emotional growth.",
    summary: "Techniques for building emotional strength in children",
    category: "PSYCHOLOGICAL_COUNSELING" as const,
    subCategory: "Emotional Health",
    fileType: "pdf",
    fileSize: 1536000,
    isProcessed: true
  },
  {
    title: "Understanding Trauma in Underprivileged Children",
    content: "A detailed guide to recognizing and addressing trauma symptoms in children from disadvantaged backgrounds. This resource covers poverty-related stress, family dysfunction, community violence impacts, and systemic discrimination effects. It provides practical tools for trauma assessment, intervention strategies, and long-term support planning. The guide emphasizes building trust, creating safe spaces, and involving families and communities in the healing process. It includes case studies, warning signs to watch for, and referral protocols for severe cases.",
    summary: "Trauma recognition and intervention strategies",
    category: "PSYCHOLOGICAL_COUNSELING" as const,
    subCategory: "Trauma Support",
    fileType: "pdf",
    fileSize: 3072000,
    isProcessed: true
  },
  {
    title: "STEM Career Pathways for Indian Students",
    content: "Detailed pathways for science, technology, engineering, and mathematics careers in India. This comprehensive guide includes entrance exam preparation strategies, college selection criteria, scholarship opportunities, and skill development roadmaps. It covers emerging fields like artificial intelligence, biotechnology, renewable energy, and space technology. The resource provides information about government initiatives, industry partnerships, and international opportunities. It also addresses gender disparities in STEM and provides strategies for encouraging girls in science and technology.",
    summary: "STEM career guidance for Indian students",
    category: "CAREER_GUIDANCE" as const,
    subCategory: "STEM Fields",
    fileType: "pdf",
    fileSize: 2560000,
    isProcessed: true
  },
  {
    title: "Life Skills Development Curriculum",
    content: "Age-appropriate life skills curriculum covering communication, decision-making, problem-solving, critical thinking, and interpersonal skills. This curriculum is designed to be implemented in both formal and informal educational settings. It includes modules on financial literacy, digital citizenship, emotional intelligence, and leadership development. The content is culturally adapted for Indian contexts and includes activities, games, and exercises that can be conducted with minimal resources. Assessment rubrics and progress tracking tools are included.",
    summary: "Comprehensive life skills development program",
    category: "LIFE_SKILLS" as const,
    subCategory: "Personal Development",
    fileType: "pdf",
    fileSize: 1843200,
    isProcessed: true
  },
  {
    title: "Digital Learning Resources for Underprivileged Children",
    content: "A compilation of free and accessible digital learning resources specifically curated for children from underprivileged backgrounds. This guide includes information about free online courses, educational apps that work on basic smartphones, offline learning materials, and community-based digital learning centers. It provides practical advice on overcoming technology barriers, managing screen time, and ensuring safe internet usage. The resource also covers government digital initiatives and how to access them.",
    summary: "Digital learning tools and resources for disadvantaged children",
    category: "EDUCATIONAL_RESOURCES" as const,
    subCategory: "Digital Learning",
    fileType: "pdf",
    fileSize: 1228800,
    isProcessed: true
  },
  {
    title: "Mental Health First Aid for Volunteers",
    content: "Essential mental health first aid training for volunteers working with children in distress. This guide covers crisis intervention techniques, suicide risk assessment, recognizing mental health emergencies, and appropriate referral procedures. It emphasizes the importance of self-care for volunteers and provides strategies for managing secondary trauma. The content includes cultural considerations, communication techniques for different age groups, and legal and ethical guidelines for volunteer counselors.",
    summary: "Mental health emergency response guide for volunteers",
    category: "PSYCHOLOGICAL_COUNSELING" as const,
    subCategory: "Crisis Intervention",
    fileType: "pdf",
    fileSize: 2097152,
    isProcessed: true
  },
  {
    title: "Family Engagement Strategies in Counseling",
    content: "Comprehensive strategies for engaging families in the counseling process for underprivileged children. This resource addresses cultural barriers, economic constraints, and logistical challenges that families face when participating in counseling. It provides practical tools for family assessment, communication strategies for different family structures, and techniques for building trust with hesitant family members. The guide includes culturally sensitive approaches and addresses common concerns families have about counseling.",
    summary: "Methods for involving families in the counseling process",
    category: "PSYCHOLOGICAL_COUNSELING" as const,
    subCategory: "Family Therapy",
    fileType: "pdf",
    fileSize: 1572864,
    isProcessed: true
  }
];

// Tags data
const tagsData = [
  { name: "Academic Support", category: "EDUCATIONAL" as const, color: "#3B82F6" },
  { name: "Career Confusion", category: "ISSUE" as const, color: "#EF4444" },
  { name: "Family Problems", category: "ISSUE" as const, color: "#F59E0B" },
  { name: "Low Self-Esteem", category: "ISSUE" as const, color: "#8B5CF6" },
  { name: "Financial Stress", category: "ISSUE" as const, color: "#EC4899" },
  { name: "Mathematics", category: "INTEREST" as const, color: "#10B981" },
  { name: "Science", category: "INTEREST" as const, color: "#06B6D4" },
  { name: "Arts", category: "INTEREST" as const, color: "#F97316" },
  { name: "Sports", category: "INTEREST" as const, color: "#84CC16" },
  { name: "Technology", category: "INTEREST" as const, color: "#6366F1" },
  { name: "Leadership", category: "SKILL" as const, color: "#DC2626" },
  { name: "Communication", category: "SKILL" as const, color: "#059669" },
  { name: "Problem Solving", category: "SKILL" as const, color: "#7C3AED" },
  { name: "Teenage", category: "DEMOGRAPHIC" as const, color: "#BE123C" },
  { name: "Primary School", category: "DEMOGRAPHIC" as const, color: "#1D4ED8" },
  { name: "High School", category: "DEMOGRAPHIC" as const, color: "#B91C1C" },
  { name: "Rural Background", category: "DEMOGRAPHIC" as const, color: "#059669" },
  { name: "Urban Slum", category: "DEMOGRAPHIC" as const, color: "#DC2626" },
  { name: "Single Parent", category: "DEMOGRAPHIC" as const, color: "#7C3AED" },
  { name: "Economic Hardship", category: "ISSUE" as const, color: "#EF4444" }
];

async function main() {
  console.log("🌱 Starting enhanced database seeding...");

  try {
    // Clear existing data (maintaining order due to foreign key constraints)
    console.log("🧹 Clearing existing data...");
    await prisma.documentChunk.deleteMany();
    await prisma.sessionSummary.deleteMany();
    await prisma.session.deleteMany();
    await prisma.chatMessage.deleteMany();
    await prisma.concern.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.knowledgeBase.deleteMany();
    await prisma.culturalStory.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.child.deleteMany();
    await prisma.user.deleteMany();

    // Create users with approval statuses
    console.log("👥 Creating users with approval workflow...");
    const createdUsers = [];
    for (const user of userData) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      const createdUser = await prisma.user.create({
        data: {
          ...user,
          password: hashedPassword,
          // Set approver for approved users
          approvedBy: user.approvalStatus === "APPROVED" && user.role === "VOLUNTEER" ? undefined : undefined,
          approvedAt: user.approvalStatus === "APPROVED" ? new Date() : undefined
        }
      });
      createdUsers.push(createdUser);
    }

    // Update approved volunteers with approver information
    const adminUser = createdUsers.find(u => u.email === "admin@counseling.org");
    if (adminUser) {
      await prisma.user.updateMany({
        where: {
          approvalStatus: "APPROVED",
          role: "VOLUNTEER"
        },
        data: {
          approvedBy: adminUser.id,
          approvedAt: new Date()
        }
      });
    }

    // Create tags
    console.log("🏷️ Creating tags...");
    for (const tag of tagsData) {
      await prisma.tag.create({
        data: tag
      });
    }

    // Get created users for relations
    const admin = await prisma.user.findUnique({ where: { email: "admin@counseling.org" } });
    const approvedVolunteers = await prisma.user.findMany({ 
      where: { 
        role: "VOLUNTEER",
        approvalStatus: "APPROVED"
      } 
    });

    // Create cultural stories
    console.log("📚 Creating cultural stories...");
    for (const story of culturalStories) {
      await prisma.culturalStory.create({
        data: {
          title: story.title,
          source: story.source as any,
          summary: story.summary,
          fullStory: story.fullStory,
          themes: story.themes,
          applicableFor: story.applicableFor,
          moralLessons: story.moralLessons,
          tags: story.tags,
          createdById: admin!.id
        }
      });
    }

    // Create knowledge base entries with enhanced data
    console.log("📖 Creating enhanced knowledge base entries...");
    for (const entry of knowledgeBaseEntries) {
      const kbEntry = await prisma.knowledgeBase.create({
        data: {
          ...entry,
          createdById: admin!.id
        }
      });

      // Create sample document chunks for RAG functionality
      const chunks = [
        {
          content: entry.content.substring(0, 500),
          chunkIndex: 0,
          embeddings: JSON.stringify([0.1, 0.2, 0.3, 0.4, 0.5]), // Mock embeddings
          metadata: JSON.stringify({ section: "introduction", wordCount: 100 })
        },
        {
          content: entry.content.substring(500, 1000),
          chunkIndex: 1,
          embeddings: JSON.stringify([0.2, 0.3, 0.4, 0.5, 0.6]), // Mock embeddings
          metadata: JSON.stringify({ section: "main_content", wordCount: 100 })
        }
      ];

      for (const chunk of chunks) {
        await prisma.documentChunk.create({
          data: {
            ...chunk,
            knowledgeBaseId: kbEntry.id
          }
        });
      }
    }

    // Create children
    console.log("👶 Creating child profiles...");
    const createdChildren = [];
    for (const child of childProfiles) {
      const createdChild = await prisma.child.create({
        data: child
      });
      createdChildren.push(createdChild);
    }

    // Create assignments (only for approved volunteers)
    console.log("🤝 Creating assignments...");
    for (let i = 0; i < createdChildren.length; i++) {
      const volunteer = approvedVolunteers[i % approvedVolunteers.length];
      await prisma.assignment.create({
        data: {
          volunteerId: volunteer.id,
          child_id: createdChildren[i].id,
          notes: `Assigned based on volunteer specialization in ${volunteer.specialization}`
        }
      });
    }

    // Create comprehensive sample concerns
    console.log("⚠️ Creating sample concerns...");
    const concernCategories = ["ACADEMIC", "FAMILY", "EMOTIONAL", "CAREER", "SOCIAL", "BEHAVIORAL", "HEALTH", "FINANCIAL"];
    const concernSeverities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    const concernStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED"];
    
    for (let i = 0; i < 35; i++) {
      const randomChild = createdChildren[Math.floor(Math.random() * createdChildren.length)];
      const randomCategory = concernCategories[Math.floor(Math.random() * concernCategories.length)];
      const randomSeverity = concernSeverities[Math.floor(Math.random() * concernSeverities.length)];
      const randomStatus = concernStatuses[Math.floor(Math.random() * concernStatuses.length)];
      
      const concernTitles = {
        ACADEMIC: ["Struggling with mathematics", "Poor reading comprehension", "Exam anxiety", "Difficulty concentrating"],
        FAMILY: ["Parents fighting frequently", "Financial stress at home", "Sibling rivalry", "Lack of parental support"],
        EMOTIONAL: ["Feeling sad and lonely", "Anger management issues", "Low self-esteem", "Anxiety about future"],
        CAREER: ["Confused about career choices", "Pressure to choose traditional careers", "Lack of information about opportunities"],
        SOCIAL: ["Difficulty making friends", "Being bullied at school", "Peer pressure", "Social isolation"],
        BEHAVIORAL: ["Aggressive behavior", "Difficulty following rules", "Attention deficit", "Hyperactivity"],
        HEALTH: ["Chronic headaches", "Sleep problems", "Nutritional deficiency", "Vision problems"],
        FINANCIAL: ["Cannot afford school supplies", "Pressure to work and earn", "Family debt stress", "Food insecurity"]
      };
      
      const titles = concernTitles[randomCategory as keyof typeof concernTitles];
      const randomTitle = titles[Math.floor(Math.random() * titles.length)];
      
      await prisma.concern.create({
        data: {
          child_id: randomChild.id,
          title: randomTitle,
          description: `Detailed description of ${randomTitle.toLowerCase()} affecting ${randomChild.name}`,
          category: randomCategory as any,
          severity: randomSeverity as any,
          status: randomStatus as any,
          resolvedAt: randomStatus === "RESOLVED" ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000) : undefined,
          resolution: randomStatus === "RESOLVED" ? "Successfully addressed through counseling and family support" : undefined
        }
      });
    }

    // Create comprehensive sample sessions
    console.log("📋 Creating sample sessions with enhanced data...");
    const sessionTypes = ["COUNSELING", "CAREER_GUIDANCE", "PSYCHOLOGICAL_SUPPORT", "FOLLOW_UP"];
    const sessionStatuses = ["COMPLETED", "PLANNED", "IN_PROGRESS"];
    
    for (let i = 0; i < 25; i++) {
      const randomChild = createdChildren[Math.floor(Math.random() * createdChildren.length)];
      const assignment = await prisma.assignment.findFirst({
        where: { child_id: randomChild.id }
      });
      
      if (assignment) {
        const randomType = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];
        const randomStatus = sessionStatuses[Math.floor(Math.random() * sessionStatuses.length)];
        const baseDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000); // Random date in last 60 days
        
        const session = await prisma.session.create({
          data: {
            child_id: randomChild.id,
            volunteerId: assignment.volunteerId,
            scheduledAt: baseDate,
            startedAt: randomStatus !== "PLANNED" ? baseDate : undefined,
            endedAt: randomStatus === "COMPLETED" ? new Date(baseDate.getTime() + 60 * 60 * 1000) : undefined,
            status: randomStatus as any,
            sessionType: randomType as any,
            notes: `${randomType.replace('_', ' ')} session with ${randomChild.name}. ${randomStatus === "COMPLETED" ? "Child showed good engagement and progress." : "Session in progress."}`
          }
        });

        // Create session summary only for completed sessions
        if (randomStatus === "COMPLETED") {
          const culturalStoriesUsed = culturalStories.slice(0, 2).map(s => s.title);
          const resolutionStatuses = ["RESOLVED", "IN_PROGRESS", "PENDING"];
          const randomResolution = resolutionStatuses[Math.floor(Math.random() * resolutionStatuses.length)];
          
          await prisma.sessionSummary.create({
            data: {
              sessionId: session.id,
              summary: `Productive ${randomType.replace('_', ' ')} session with ${randomChild.name}. Discussed ${randomChild.challenges.join(', ')} and provided appropriate guidance using cultural wisdom and evidence-based techniques.`,
              concernsDiscussed: randomChild.challenges.slice(0, 2),
              culturalStoriesUsed: culturalStoriesUsed,
              progressMade: "Child showed understanding and willingness to implement suggested strategies",
              nextSteps: ["Follow up on progress", "Involve family in next session", "Provide additional resources"],
              resolutionStatus: randomResolution as any,
              followUpNeeded: randomResolution !== "RESOLVED",
              followUpDate: randomResolution !== "RESOLVED" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined
            }
          });
        }
      }
    }

    // Create sample chat messages for AI interaction testing
    console.log("💬 Creating sample chat messages...");
    for (let i = 0; i < 15; i++) {
      const randomVolunteer = approvedVolunteers[Math.floor(Math.random() * approvedVolunteers.length)];
      await prisma.chatMessage.create({
        data: {
          userId: randomVolunteer.id,
          message: "Can you help me understand how to counsel a child with academic anxiety?",
          response: "Academic anxiety in children can manifest in various ways. Here are some evidence-based strategies: 1) Create a safe space for the child to express their fears, 2) Use breathing exercises and mindfulness techniques, 3) Break down academic tasks into smaller, manageable goals, 4) Celebrate small achievements to build confidence. Consider sharing the story of Arjuna's focus from the Mahabharata to illustrate the importance of concentration and practice.",
          context: "Based on knowledge base: Emotional Resilience Building Techniques and Cultural Wisdom stories",
          isSystemMsg: false
        }
      });
    }

    console.log("✅ Enhanced database seeding completed successfully!");
    console.log("📊 Created:");
    console.log(`   👥 ${userData.length} users (2 admins, ${approvedVolunteers.length} approved volunteers, 2 pending, 1 rejected)`);
    console.log(`   👶 ${childProfiles.length} child profiles`);
    console.log(`   📚 ${culturalStories.length} cultural stories`);
    console.log(`   📖 ${knowledgeBaseEntries.length} knowledge base entries with document chunks`);
    console.log(`   🏷️ ${tagsData.length} tags`);
    console.log("   ⚠️ 35 sample concerns with various statuses");
    console.log("   📋 25 sample sessions with comprehensive data");
    console.log("   💬 15 sample AI chat interactions");
    console.log("   🔧 Document chunks for RAG functionality");

  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

