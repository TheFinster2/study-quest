/* Multiple choice — added in the StudyQuest port (50 questions, 5 per topic).

   Same house rules as the original banks: every question explains itself,
   every distractor carries its own reason, and option lengths are balanced so
   that "pick the longest" does not work (validate.js checks each topic). These
   deliberately pad the thin topics (P4–P6) that the HP bosses draw from. */

window.ECON = window.ECON || {}; ECON.DATA = ECON.DATA || {};

ECON.DATA.mcq_x_prelim = [

// ── P1 Introduction to Economics ────────────────────────────────────────
{ id:"p1-x01", mod:"P1", topic:"Production possibility frontier", diff:2,
  q:"An economy moves from a point inside its production possibility frontier to a point on it. This shows",
  options:["an increase in the economy's productive capacity","previously unemployed resources being put to use","a rise in the opportunity cost of both goods","a shift in consumer preferences between the goods"], answer:1,
  why:"A point inside the PPF means resources are unemployed or used inefficiently. Moving onto the frontier uses them, so output of one or both goods rises without the frontier itself moving.",
  distractors:{0:"Productive capacity rising is an outward shift of the frontier, not a move towards it.",2:"Moving from inside to the frontier need not give up any of either good, so there is no rise in opportunity cost.",3:"Preferences determine where on the frontier an economy chooses to be, not whether it reaches it."} },

{ id:"p1-x02", mod:"P1", topic:"Factors of production", diff:1,
  q:"The reward earned by the factor of production 'capital' is",
  options:["wages and salaries","rent","interest","profit"], answer:2,
  why:"Each factor has its own reward: labour earns wages, land earns rent, capital earns interest and enterprise (entrepreneurship) earns profit.",
  distractors:{0:"Wages are the return to labour.",1:"Rent is the return to land and natural resources.",3:"Profit is the return to enterprise, the factor that organises the others and bears the risk."} },

{ id:"p1-x03", mod:"P1", topic:"Circular flow", diff:2,
  q:"In the five-sector circular flow model, which of the following is a leakage?",
  options:["Government spending on new hospitals","Export revenue earned by Australian miners","Household saving deposited in a bank","Business investment in new machinery"], answer:2,
  why:"Leakages (withdrawals) are saving, taxation and imports: income that does not return to domestic spending directly. Saving is a leakage.",
  distractors:{0:"Government spending is an injection into the circular flow.",1:"Exports are an injection: foreign spending on domestic output.",3:"Investment is an injection, the counterpart of saving in the financial sector."} },

{ id:"p1-x04", mod:"P1", topic:"Economic systems", diff:2,
  q:"In a market economy, the question of 'for whom to produce' is answered mainly by",
  options:["central planners allocating output to households","the incomes households earn from selling their factors","a democratic vote on how all output should be distributed","tradition and the customs of each community"], answer:1,
  why:"In a market economy output goes to those willing and able to pay, so the distribution of goods follows the distribution of income earned from supplying labour, land, capital and enterprise.",
  distractors:{0:"Allocation by planners is the defining feature of a command economy.",2:"Market economies do not distribute output by vote; governments may redistribute some income, but the market allocates by price.",3:"Tradition answers the basic questions in a traditional economy, not a market one."} },

{ id:"p1-x05", mod:"P1", topic:"Standard of living", diff:2,
  q:"Real GDP per capita is an incomplete measure of living standards mainly because it",
  options:["ignores the effects of inflation on output","counts only goods produced by the government","excludes non-market work and the distribution of income","double counts intermediate goods in the final total of output"], answer:2,
  why:"GDP per capita measures average market output. It leaves out unpaid work such as caring and volunteering, says nothing about how income is shared, and ignores leisure and environmental quality.",
  distractors:{0:"'Real' GDP is already adjusted for inflation.",1:"GDP counts private and public sector output alike.",3:"GDP counts only final goods and services precisely to avoid double counting."} },

// ── P2 Consumers and Business ───────────────────────────────────────────
{ id:"p2-x01", mod:"P2", topic:"Consumer decisions", diff:2,
  q:"A consumer keeps buying a product until the extra satisfaction from one more unit is worth less than its price. This behaviour reflects",
  options:["the law of diminishing marginal utility","the law of increasing opportunity cost","economies of scale in consumption","the income effect of a price fall"], answer:0,
  why:"Each additional unit of a good gives less extra satisfaction (marginal utility). A rational consumer buys until the marginal utility of the last unit no longer justifies its price.",
  distractors:{1:"Increasing opportunity cost describes production along a PPF, not consumer choice.",2:"Economies of scale are about a firm's costs falling as output grows.",3:"The income effect explains part of why quantity demanded rises when price falls, not when to stop buying."} },

{ id:"p2-x02", mod:"P2", topic:"Business costs", diff:2,
  q:"A cafe's rent is $4000 a month regardless of how many coffees it sells. Its rent is a",
  options:["variable cost, because it is paid again each month","marginal cost of producing the next coffee","fixed cost, because it does not change with output","sunk benefit that lowers average revenue"], answer:2,
  why:"Fixed costs do not vary with the level of output in the short run. Rent is paid whether the cafe sells ten coffees or ten thousand.",
  distractors:{0:"Being paid regularly does not make a cost variable; variable costs change with output, like milk and beans.",1:"Marginal cost is the extra cost of one more unit, and one more coffee adds nothing to the rent.",3:"There is no such concept; costs do not change revenue."} },

{ id:"p2-x03", mod:"P2", topic:"Productivity", diff:2,
  q:"A factory produces the same output as last year with 10% fewer workers. Its labour productivity has",
  options:["fallen by about 10%","risen by about 11%","stayed the same, as output is unchanged","risen by exactly 10% of total costs"], answer:1,
  why:"Labour productivity is output per worker. The same output divided by 0.9 of the workers is 1/0.9 ≈ 1.11 times as much per worker, a rise of about 11%.",
  distractors:{0:"Fewer workers producing the same output means each produces more, so productivity rises.",2:"Productivity is output per unit of input, and the input has fallen.",3:"Productivity is measured against labour input, not as a share of total costs."} },

{ id:"p2-x04", mod:"P2", topic:"Business goals", diff:1,
  q:"A firm cuts its prices below those of rivals to win customers, accepting lower profits for now. Its main goal is most likely",
  options:["maximising short-run profit","increasing its market share","reducing its fixed costs","satisfying its shareholders' dividend demands"], answer:1,
  why:"Sacrificing profit today to win customers from rivals is a market-share strategy: the firm expects a larger share to pay off in future profits or security.",
  distractors:{0:"Deliberately accepting lower profits is the opposite of short-run profit maximisation.",2:"Price cuts do nothing to fixed costs such as rent.",3:"Lower profits generally mean lower dividends, not higher ones."} },

{ id:"p2-x05", mod:"P2", topic:"Economies of scale", diff:2,
  q:"A supermarket chain negotiates lower prices from suppliers because it buys in enormous quantities. This is an example of",
  options:["a diseconomy of scale","a purchasing (bulk-buying) economy of scale","an external economy of scale for the whole industry","the law of diminishing returns"], answer:1,
  why:"Purchasing economies are internal economies of scale: a large firm's buying power lets it obtain inputs more cheaply per unit, lowering its average cost.",
  distractors:{0:"Diseconomies raise average cost as a firm grows; this lowers it.",2:"External economies come from the growth of the whole industry or region, not one firm's own size.",3:"Diminishing returns describe adding a variable input to a fixed one in the short run."} },

// ── P3 Markets ──────────────────────────────────────────────────────────
{ id:"p3-x01", mod:"P3", topic:"Market structures", diff:2,
  q:"A market with a few large firms, high barriers to entry and prices that tend to be stable is best described as",
  options:["perfect competition","monopolistic competition","oligopoly","pure monopoly"], answer:2,
  why:"Oligopoly is a market dominated by a few interdependent firms behind high barriers to entry. Because each firm watches its rivals, prices tend to be sticky and competition often shifts to advertising.",
  distractors:{0:"Perfect competition has many small firms and free entry.",1:"Monopolistic competition has many firms selling differentiated products with low barriers.",3:"A pure monopoly has a single seller, not a few."} },

{ id:"p3-x02", mod:"P3", topic:"Government intervention", diff:2,
  q:"The government sets a price ceiling on rents below the market equilibrium. The most likely result is",
  options:["a surplus of rental housing","a shortage of rental housing","no change, because landlords absorb the cost","a rise in the equilibrium rent"], answer:1,
  why:"A binding price ceiling holds the price below equilibrium, so quantity demanded exceeds quantity supplied: a shortage, often with queues and deteriorating quality.",
  distractors:{0:"A surplus comes from a price floor set above equilibrium, not a ceiling below it.",2:"A binding ceiling changes both quantities, because it changes the price both sides face.",3:"The ceiling stops the rent reaching equilibrium; it cannot raise it."} },

{ id:"p3-x03", mod:"P3", topic:"Demand and supply", diff:2,
  q:"A fall in the price of a good causes a rise in the quantity demanded. On a diagram this is shown as",
  options:["a shift of the demand curve to the right","a movement down along the demand curve","a shift of the supply curve to the left","a movement up along the supply curve"], answer:1,
  why:"A change in the good's own price moves the market along an existing demand curve (a change in quantity demanded). Only a change in another determinant shifts the curve.",
  distractors:{0:"A shift in demand is caused by a non-price factor such as income or tastes.",2:"Nothing in the question changes the conditions of supply.",3:"The question describes buyers responding to price, which is the demand curve."} },

{ id:"p3-x04", mod:"P3", topic:"Market failure", diff:2,
  q:"Street lighting is usually provided by government because it is",
  options:["non-excludable and non-rival in consumption","a merit good that consumers overvalue","subject to negative externalities in production","a natural monopoly with falling costs"], answer:0,
  why:"Street lighting is a public good: people who do not pay cannot be excluded, and one person's use does not reduce another's. Free riding means a market would under-provide it.",
  distractors:{1:"Merit goods are under-consumed because their benefits are undervalued, not overvalued, and street lighting is a public good.",2:"The problem is that no one can be charged for it, not harmful spillovers from producing it.",3:"Natural monopoly is about scale economies, and does not explain why no one can be charged."} },

{ id:"p3-x05", mod:"P3", topic:"Elasticity", diff:3,
  q:"A tax is placed on a good whose demand is highly price inelastic. The burden of the tax is likely to fall",
  options:["mostly on producers, as consumers stop buying","mostly on consumers, as they keep buying at higher prices","equally on producers and consumers in every case","entirely on the government, which collects less revenue"], answer:1,
  why:"When demand is inelastic, consumers barely reduce the quantity they buy as price rises, so sellers can pass most of the tax on as a higher price. The incidence falls mainly on consumers.",
  distractors:{0:"Consumers stopping buying describes elastic demand, where producers bear more of the tax.",2:"Incidence depends on the relative elasticities; an equal split is a special case.",3:"Inelastic demand means quantity barely falls, so tax revenue holds up well."} }
];

ECON.DATA.mcq_x_prelim2 = [

// ── P4 Labour Markets ───────────────────────────────────────────────────
{ id:"p4-x01", mod:"P4", topic:"Demand for labour", diff:2,
  q:"The demand for labour is described as a derived demand because",
  options:["it depends on the demand for the goods labour produces","workers derive satisfaction from the work they do","it is set by awards derived from Fair Work Commission decisions","employers derive profit from paying low wages"], answer:0,
  why:"Firms do not want labour for its own sake; they hire workers to produce goods and services. So labour demand rises and falls with demand for what that labour makes.",
  distractors:{1:"Job satisfaction affects labour supply decisions, not why demand for labour is derived.",2:"Awards set minimum conditions; they are not what 'derived' refers to.",3:"This is not an economic definition, and firms' demand for labour exists whatever the wage."} },

{ id:"p4-x02", mod:"P4", topic:"Labour force", diff:2,
  q:"A person who wants a job but has stopped looking because they believe none is available is counted by the ABS as",
  options:["unemployed, as a discouraged job seeker","employed part-time","not in the labour force","underemployed"], answer:2,
  why:"To be unemployed a person must be actively looking and available for work. Discouraged job seekers are not looking, so they are classed as not in the labour force — part of hidden unemployment.",
  distractors:{0:"The unemployed must have actively sought work; discouraged workers have stopped.",1:"They have no job, so they cannot be employed part-time.",3:"Underemployed people have a job but want more hours."} },

{ id:"p4-x03", mod:"P4", topic:"Labour market outcomes", diff:2,
  q:"Which is the most likely reason a surgeon earns far more than a retail assistant?",
  options:["Surgeons work for the government, which always pays higher wages than private firms","The supply of people able to perform surgery is small relative to demand","Retail work is protected by awards but surgery is not","Surgeons belong to stronger unions than retail workers"], answer:1,
  why:"Wage differences largely reflect demand and supply for each skill. Years of training and high skill requirements restrict the supply of surgeons while the value of their work keeps demand strong.",
  distractors:{0:"Many surgeons work privately, and public-sector employment does not by itself mean higher pay.",2:"Awards set minimums, and they do not explain why one occupation's market wage is far higher.",3:"Union strength is not the main driver of the gap; retail is covered by a large union."} },

{ id:"p4-x04", mod:"P4", topic:"Wage determination", diff:2,
  q:"Under Australia's industrial relations system, an enterprise agreement is",
  options:["a minimum wage set annually for all workers","a set of pay and conditions negotiated at a single workplace","an individual contract signed by a single worker and their employer","a decision of the Reserve Bank on wage growth"], answer:1,
  why:"Enterprise agreements are collectively bargained between an employer and its employees (often through a union) and approved by the Fair Work Commission. They must leave workers better off overall than the relevant award.",
  distractors:{0:"The national minimum wage is set by the Fair Work Commission's annual wage review.",2:"An individual arrangement is a common-law contract, not an enterprise agreement.",3:"The RBA sets the cash rate; it does not set or approve wages."} },

{ id:"p4-x05", mod:"P4", topic:"Labour force", diff:3,
  q:"The working-age population is 20 million, 13 million are in the labour force and 12.4 million are employed. The unemployment rate is about",
  options:["3.0%","4.6%","4.8%","6.5%"], answer:1,
  why:"Unemployed = 13.0 − 12.4 = 0.6 million. The unemployment rate is unemployed as a share of the LABOUR FORCE: 0.6 ÷ 13 ≈ 4.6%.",
  distractors:{0:"Dividing 0.6 million by the working-age population (20 million) gives 3%, the wrong denominator.",2:"0.6 ÷ 12.4 uses employment as the denominator; the rate is measured against the labour force.",3:"The participation rate is 65%; this option confuses the two measures."} },

// ── P5 Financial Markets ────────────────────────────────────────────────
{ id:"p5-x01", mod:"P5", topic:"Financial markets", diff:1,
  q:"A company raises funds by selling newly issued shares to investors for the first time. This takes place in the",
  options:["primary market","secondary market","foreign exchange market","money market for short-term loans"], answer:0,
  why:"The primary market is where new securities are issued and the issuer receives the funds, as in an initial public offering. Later trading between investors happens on the secondary market.",
  distractors:{1:"The secondary market trades existing shares between investors; the company raises nothing there.",2:"The foreign exchange market trades currencies, not shares.",3:"The money market deals in short-term debt, not new equity."} },

{ id:"p5-x02", mod:"P5", topic:"Interest rates", diff:2,
  q:"A lender charges a higher interest rate to a start-up than to a large established company. The main reason is that the start-up",
  options:["borrows for a shorter period of time","carries a higher risk of default","is not subject to company tax","pays its interest in foreign currency"], answer:1,
  why:"Interest rates include a risk premium. A borrower more likely to default must pay more to compensate the lender for that risk.",
  distractors:{0:"Shorter loans do not generally attract higher rates on that account, and nothing says the start-up borrows for less time.",2:"Tax status is not what sets a borrower's risk premium.",3:"Nothing in the question involves foreign currency."} },

{ id:"p5-x03", mod:"P5", topic:"Regulation", diff:2,
  q:"In Australia, the prudential regulation of banks, insurers and superannuation funds is the responsibility of",
  options:["the Australian Securities and Investments Commission","the Australian Prudential Regulation Authority","the Australian Competition and Consumer Commission","the Australian Taxation Office"], answer:1,
  why:"APRA supervises deposit-taking institutions, insurers and super funds to make sure they can meet their obligations — prudential regulation. ASIC regulates market conduct and disclosure.",
  distractors:{0:"ASIC regulates corporate conduct, financial markets and consumer protection in financial services.",2:"The ACCC enforces competition and consumer law generally.",3:"The ATO collects tax; it does not supervise financial soundness."} },

{ id:"p5-x04", mod:"P5", topic:"Financial markets", diff:2,
  q:"Financial intermediaries such as banks mainly benefit the economy by",
  options:["printing money to fund government spending","channelling savings from surplus units to borrowers","setting the cash rate for the whole economy","guaranteeing a fixed return on every investment"], answer:1,
  why:"Intermediaries pool the savings of households and firms with surplus funds and lend them to those who want to borrow, reducing search and information costs and spreading risk.",
  distractors:{0:"Banks do not print money, and they do not exist to fund government.",2:"The Reserve Bank sets the cash rate target, not commercial banks.",3:"No intermediary can guarantee every investment; risk is priced, not removed."} },

{ id:"p5-x05", mod:"P5", topic:"Interest rates", diff:3,
  q:"If demand for loanable funds rises while the supply of savings is unchanged, the interest rate is most likely to",
  options:["fall, as more borrowers compete for loans","rise, as more borrowers compete for loans","stay the same, because the supply is unchanged","fall, as savers deposit more to earn interest"], answer:1,
  why:"The interest rate is the price of loanable funds. With supply unchanged, greater demand bids that price up.",
  distractors:{0:"More competition among borrowers pushes the price of funds up, not down.",2:"A rise in demand alone is enough to change the equilibrium price.",3:"Savers responding to a higher rate is a movement along supply, which follows the rate rising, not falling."} },

// ── P6 Government and the Economy ───────────────────────────────────────
{ id:"p6-x01", mod:"P6", topic:"Taxation", diff:2,
  q:"A tax that takes a rising proportion of income as income rises is",
  options:["regressive","proportional","progressive","indirect"], answer:2,
  why:"A progressive tax has an average rate that rises with income, as Australia's personal income tax does through its rising marginal rates.",
  distractors:{0:"A regressive tax takes a falling proportion of income as income rises, as a flat GST effectively does.",1:"A proportional (flat) tax takes the same proportion at every income.",3:"'Indirect' describes how a tax is collected (on spending), not how it varies with income."} },

{ id:"p6-x02", mod:"P6", topic:"Business cycle", diff:2,
  q:"During a recession, unemployment benefit payments rise and income tax revenue falls without any change in policy. These are examples of",
  options:["discretionary fiscal policy","automatic stabilisers","contractionary monetary policy","structural budget changes"], answer:1,
  why:"Automatic stabilisers are features of the budget that respond to the cycle on their own: spending rises and tax revenue falls in a downturn, cushioning aggregate demand.",
  distractors:{0:"Discretionary policy requires a deliberate decision by government; these happen automatically.",2:"Monetary policy is the Reserve Bank's use of interest rates, not the budget.",3:"Cyclical changes like these are the opposite of structural changes, which reflect policy decisions."} },

{ id:"p6-x03", mod:"P6", topic:"Aggregate demand", diff:1,
  q:"Aggregate demand is made up of",
  options:["consumption, investment, government spending and net exports","wages, rent, interest and profit","saving, taxation and imports","land, labour, capital and enterprise"], answer:0,
  why:"AD = C + I + G + (X − M): total planned spending on the economy's final goods and services.",
  distractors:{1:"These are factor incomes, the returns to the factors of production.",2:"These are the leakages from the circular flow.",3:"These are the factors of production themselves."} },

{ id:"p6-x04", mod:"P6", topic:"Government intervention", diff:2,
  q:"The government pays a subsidy to producers of solar panels. The most likely effect in the solar panel market is",
  options:["supply shifts left and the price rises","supply shifts right and the price falls","demand shifts left and the price falls","demand shifts right and the price rises"], answer:1,
  why:"A producer subsidy lowers the cost of production, so more is supplied at every price. Supply shifts right, lowering the equilibrium price and raising the quantity traded.",
  distractors:{0:"Supply shifting left is what a tax on producers does.",2:"A producer subsidy acts on costs, not on consumers' demand.",3:"A consumer rebate would shift demand; a producer subsidy shifts supply."} },

{ id:"p6-x05", mod:"P6", topic:"Budget", diff:2,
  q:"A government runs budget deficits for several years in a row. Other things equal, its net debt will",
  options:["fall, because deficits reduce spending","rise, because each deficit must be financed by borrowing","stay the same, because debt and deficits are unrelated","fall, because interest rates will rise"], answer:1,
  why:"A deficit is an annual flow; debt is the accumulated stock. Each deficit is financed by borrowing, so repeated deficits add to net debt.",
  distractors:{0:"A deficit means spending exceeds revenue; it is financed, not cancelled.",2:"Deficits and debt are directly linked: the flow adds to the stock.",3:"Higher interest rates would, if anything, raise the cost of servicing the debt."} }
];

ECON.DATA.mcq_x_hsc = [

// ── H1 The Global Economy ───────────────────────────────────────────────
{ id:"h1-x01", mod:"H1", topic:"Trade theory", diff:2,
  q:"Country A can produce both wine and cloth more cheaply than Country B. Trade can still benefit both countries because",
  options:["Country A has an absolute advantage in both goods","each country has a comparative advantage in one good","Country B can impose tariffs to protect its industries","trade always equalises wages between countries"], answer:1,
  why:"Gains from trade come from comparative advantage — lower OPPORTUNITY cost — not absolute advantage. As long as the opportunity costs differ, each country can specialise in one good and both gain.",
  distractors:{0:"Absolute advantage in both goods is the premise, not the reason trade helps.",2:"Tariffs reduce the gains from trade; they do not create them.",3:"Trade does not guarantee wage equalisation, and it is not why trade benefits both."} },

{ id:"h1-x02", mod:"H1", topic:"Global institutions", diff:2,
  q:"The main role of the World Trade Organization is to",
  options:["lend to countries facing balance of payments crises","set and enforce rules for trade between member countries","fund infrastructure projects in developing economies","coordinate interest rates among central banks"], answer:1,
  why:"The WTO administers multilateral trade agreements, hosts negotiations to reduce barriers and settles trade disputes between members.",
  distractors:{0:"Crisis lending is the role of the International Monetary Fund.",2:"Development project lending is the World Bank's role.",3:"The WTO has no role in monetary policy; central banks set their own rates."} },

{ id:"h1-x03", mod:"H1", topic:"Globalisation", diff:2,
  q:"Which is the clearest example of financial globalisation?",
  options:["A rise in tourists visiting Australia","A US pension fund buying Australian government bonds","A migrant worker moving from India to Sydney","A Chinese firm licensing an Australian song"], answer:1,
  why:"Financial globalisation is the integration of financial markets through cross-border flows of capital, such as foreign investors buying bonds and shares.",
  distractors:{0:"Tourism is trade in services.",2:"Migration is the international movement of labour.",3:"Licensing creative work is trade in services and intellectual property."} },

{ id:"h1-x04", mod:"H1", topic:"Protection", diff:2,
  q:"A tariff on imported steel is most likely to",
  options:["lower the price of steel to domestic users","raise domestic steel output and the price paid by users","increase the quantity of steel imported","benefit steel-using industries at the producers' expense"], answer:1,
  why:"A tariff raises the domestic price of imports. Domestic producers expand output behind that price, imports fall, and steel-using industries pay more.",
  distractors:{0:"The tariff raises the price domestic users pay.",2:"Imports fall, because the tariff makes them dearer.",3:"The reverse: domestic producers gain and steel-using industries lose."} },

{ id:"h1-x05", mod:"H1", topic:"Development", diff:2,
  q:"The Human Development Index combines measures of",
  options:["income per person, life expectancy and education","GDP growth, inflation and unemployment","exports, imports and foreign debt","inequality, poverty and government spending"], answer:0,
  why:"The UNDP's HDI combines a long and healthy life (life expectancy), knowledge (years of schooling) and a decent standard of living (gross national income per person).",
  distractors:{1:"These are macroeconomic performance measures, not components of the HDI.",2:"These are external sector measures.",3:"Inequality-adjusted versions exist, but these are not the HDI's three dimensions."} },

// ── H2 Australia's Place in the Global Economy ──────────────────────────
{ id:"h2-x01", mod:"H2", topic:"Balance of payments", diff:2,
  q:"Interest paid by Australian borrowers to overseas lenders is recorded in the",
  options:["balance on goods and services","primary income account","secondary income account","financial account"], answer:1,
  why:"Primary income records returns on factors of production across borders — interest, dividends and compensation of employees. Interest on foreign debt is a primary income debit.",
  distractors:{0:"Goods and services records trade, not returns on investment.",2:"Secondary income records transfers such as foreign aid and gifts, with nothing given in return.",3:"The financial account records the borrowing itself (the flow of capital), not the interest paid on it."} },

{ id:"h2-x02", mod:"H2", topic:"Exchange rates", diff:2,
  q:"Other things equal, a rise in the Reserve Bank's cash rate relative to overseas rates is most likely to",
  options:["depreciate the Australian dollar","appreciate the Australian dollar","have no effect on the exchange rate","reduce foreign demand for Australian assets"], answer:1,
  why:"Higher Australian interest rates make Australian financial assets more attractive, raising demand for the dollar to buy them. The currency tends to appreciate.",
  distractors:{0:"Depreciation would follow a relative FALL in Australian rates.",2:"Interest rate differentials are a major influence on capital flows and the exchange rate.",3:"Higher returns increase foreign demand for Australian assets."} },

{ id:"h2-x03", mod:"H2", topic:"Terms of trade", diff:2,
  q:"The prices of iron ore and coal rise sharply while import prices are steady. Australia's terms of trade will",
  options:["fall, because exports become less competitive","rise, because export prices rose relative to import prices","stay the same, because import prices did not change","fall, because the current account deficit widens"], answer:1,
  why:"The terms of trade index is export prices divided by import prices × 100. Higher export prices with steady import prices raise it.",
  distractors:{0:"The terms of trade measure relative prices, and a rise in export prices raises them.",2:"Only one side needs to change for the ratio to change.",3:"Higher export prices tend to narrow, not widen, the deficit, and they raise the terms of trade either way."} },

{ id:"h2-x04", mod:"H2", topic:"Foreign liabilities", diff:3,
  q:"Australia's net foreign liabilities are best described as",
  options:["the annual current account deficit","Australia's foreign-owned liabilities minus the foreign assets Australians own","the government's budget deficit funded offshore","the value of imports minus the value of exports"], answer:1,
  why:"Net foreign liabilities are a stock: what Australia owes to, and foreigners own in, Australia (debt and equity), less what Australians own abroad.",
  distractors:{0:"The current account deficit is an annual flow that adds to the stock, not the stock itself.",2:"Foreign liabilities are mostly private, not only government debt.",3:"Imports minus exports is a trade deficit, again a flow."} },

{ id:"h2-x05", mod:"H2", topic:"Free trade agreements", diff:2,
  q:"A criticism of bilateral free trade agreements is that they can",
  options:["raise tariffs between the two partner countries","divert trade from lower-cost non-member suppliers","prevent the partners from trading with each other","require both countries to adopt one currency"], answer:1,
  why:"Preferential agreements can cause trade diversion: imports shift from a cheaper non-member to a partner that is now tariff-free but higher cost, reducing efficiency.",
  distractors:{0:"FTAs lower tariffs between the partners.",2:"They are designed to increase trade between the partners.",3:"A currency union is a separate, much deeper form of integration."} },

// ── H3 Economic Issues ──────────────────────────────────────────────────
{ id:"h3-x01", mod:"H3", topic:"Unemployment", diff:2,
  q:"Workers lose their jobs when their industry declines because of new technology, and their skills do not suit growing industries. This is",
  options:["frictional unemployment","cyclical unemployment","structural unemployment","seasonal unemployment"], answer:2,
  why:"Structural unemployment arises from a mismatch between the skills or location of workers and the jobs available, often after technological change or shifts in demand between industries.",
  distractors:{0:"Frictional unemployment is short-term, while people move between jobs.",1:"Cyclical unemployment comes from a downturn in aggregate demand across the economy.",3:"Seasonal unemployment follows regular patterns such as harvests or tourist seasons."} },

{ id:"h3-x02", mod:"H3", topic:"Inflation", diff:2,
  q:"Rising oil prices increase firms' transport and energy costs, which are passed on as higher prices. This is",
  options:["demand-pull inflation","cost-push inflation","imported deflation","an inflationary expectations spiral"], answer:1,
  why:"Cost-push inflation comes from rising production costs — wages, energy, raw materials — that firms pass on to consumers as higher prices.",
  distractors:{0:"Demand-pull inflation comes from aggregate demand outstripping supply, not rising costs.",2:"Higher import prices raise, not lower, the price level.",3:"Expectations may follow, but the source described here is higher costs."} },

{ id:"h3-x03", mod:"H3", topic:"Economic growth", diff:2,
  q:"Which is most likely to raise an economy's long-run (potential) growth rate?",
  options:["a one-off cut in interest rates","sustained improvement in labour productivity","a temporary rise in government spending","a fall in the exchange rate"], answer:1,
  why:"Long-run growth depends on the growth of productive capacity: more labour and capital and, above all, productivity growth. Demand stimulus lifts output only temporarily.",
  distractors:{0:"Lower rates boost demand in the short run; they do not raise capacity in themselves.",2:"Temporary spending boosts demand, not the economy's productive potential.",3:"A depreciation helps trade-exposed industries in the short run; it does not lift capacity by itself."} },

{ id:"h3-x04", mod:"H3", topic:"Inequality", diff:2,
  q:"The Lorenz curve moves further away from the line of equality. This means",
  options:["income has become more equally distributed","income has become less equally distributed","average income has fallen","the Gini coefficient has fallen"], answer:1,
  why:"The further the Lorenz curve bows away from the 45° line of equality, the less equal the distribution. The Gini coefficient, the area between them as a share, rises.",
  distractors:{0:"Moving towards the line of equality would mean more equal distribution.",2:"The Lorenz curve shows distribution, not the level of income.",3:"A curve further from equality means a HIGHER Gini coefficient."} },

{ id:"h3-x05", mod:"H3", topic:"Environmental sustainability", diff:2,
  q:"Ecologically sustainable development aims to",
  options:["maximise growth this year regardless of future costs","meet present needs without compromising future generations","stop all economic growth to protect the environment","replace market prices with government quotas"], answer:1,
  why:"Ecologically sustainable development seeks growth that meets today's needs without reducing the ability of future generations to meet theirs, by accounting for environmental costs.",
  distractors:{0:"Ignoring future costs is exactly what sustainability rules out.",2:"ESD accepts growth; it asks that growth be sustainable.",3:"ESD can use market mechanisms, such as pricing pollution, not only quotas."} },

// ── H4 Economic Policies and Management ─────────────────────────────────
{ id:"h4-x01", mod:"H4", topic:"Monetary policy", diff:2,
  q:"The Reserve Bank's inflation target is to keep annual consumer price inflation",
  options:["below 1% at all times to protect savers","between 2 and 3%, aiming for the midpoint","at exactly 4% in every single year","equal to the rate of wage growth"], answer:1,
  why:"The RBA's inflation target is to keep annual CPI inflation between 2 and 3%, aiming for the midpoint of that range, over time.",
  distractors:{0:"Inflation that low risks deflation; the target is 2–3%.",2:"No such target exists; 4% is above the band.",3:"Wage growth matters to the outlook, but it is not the target."} },

{ id:"h4-x02", mod:"H4", topic:"Fiscal policy", diff:2,
  q:"The government cuts spending and raises taxes to reduce inflationary pressure. Its fiscal stance is",
  options:["expansionary","contractionary","neutral","cyclically adjusted"], answer:1,
  why:"Reducing government spending and raising taxes lowers aggregate demand, which is a contractionary stance used to ease inflation.",
  distractors:{0:"Expansionary policy raises spending or cuts taxes to boost demand.",2:"A neutral stance would leave demand pressure unchanged.",3:"'Cyclically adjusted' describes a way of measuring the budget balance, not the direction of policy."} },

{ id:"h4-x03", mod:"H4", topic:"Microeconomic policy", diff:2,
  q:"Microeconomic reform mainly aims to",
  options:["fine-tune aggregate demand over each stage of the business cycle","raise efficiency and productivity to lift aggregate supply","set the cash rate to hit the inflation target","balance the budget in each financial year"], answer:1,
  why:"Microeconomic (supply-side) policies such as competition reform, tax reform and deregulation aim to make markets more efficient, lifting productivity and the economy's productive capacity.",
  distractors:{0:"Managing demand over the cycle is the job of macroeconomic policy.",2:"That is monetary policy.",3:"That is a fiscal objective, and not the aim of microeconomic reform."} },

{ id:"h4-x04", mod:"H4", topic:"Policy mix", diff:3,
  q:"Monetary policy is often preferred over fiscal policy for managing demand in the short term because it",
  options:["has no time lags at all","can be adjusted quickly and independently of the budget process","directly targets particular industries","always reduces unemployment and inflation together in the short run"], answer:1,
  why:"The Reserve Bank's Monetary Policy Board can change the cash rate at any of its scheduled meetings, independently of government, whereas fiscal changes usually wait for the budget and parliament. Monetary policy still has long lags in its effects.",
  distractors:{0:"Monetary policy has significant lags in its effects on the economy, often a year or more.",2:"Interest rates affect the whole economy; they cannot be aimed at one industry.",3:"There is often a short-run trade-off between the two, not a guarantee to reduce both."} },

{ id:"h4-x05", mod:"H4", topic:"Environmental policy", diff:2,
  q:"An emissions trading scheme reduces pollution mainly by",
  options:["banning the most polluting firms from operating outright","capping total emissions and letting firms trade permits","subsidising consumers to buy imported goods","fixing the price of electricity by law"], answer:1,
  why:"A cap-and-trade scheme limits total emissions and issues tradable permits. Firms that can cut emissions cheaply sell permits to those that cannot, so the cap is met at least cost.",
  distractors:{0:"An outright ban is direct regulation, not a trading scheme.",2:"Import subsidies have nothing to do with emissions trading.",3:"Price controls are a different policy; an ETS sets a quantity and lets the permit price emerge."} }
];
