config = {
    "myopenkey": "YOUR_OPENAI_KEY",
    "modelname": "gpt-3.5-turbo",
    "jsonbuild": """
            Analysiere den folgenden Text auf Deutsch und gib die Ergebnisse im JSON-Format zurück:
            Ergebnisformat:
            {
                "Transcript": string,
                "Eindruck": string,
                "Gemeinschaft": integer,
                "Vertrauen": integer,
                "Gegenseitig": integer,
                "Nachhaltig": integer,
                "Inklusion": integer,
                "Kommerziell": integer,
                "SozialesMiteinander": integer,
                "GleichrangigeSelbstOrganisation": integer,
                "SorgendesSelbstbestimmtesWirtschaften": integer
            }
            string 1: "Transcript" sollte den Text nochmal beinhalten.
            string 2: "Reflektiere" unter Eindruck den Inhalt, wie gut der Text die Werte des Commoning widerspiegelt. Welche Inhalte des Textes entsprechen besonders der Logik des Commoning, und welche widersprechen ihr besonders? 
            integer 3: Der Wert für "Gemeinschaft" sollte die Verbundenheit der Menschen durch eine Zahl zwischen 0 und 100 ausdrücken, wobei 0 sehr egoistisch ist und 100 sehr gemeinschaftssinnig ist.
            integer 4: Der Wert für "Vertrauen" sollte die Vertrauenswürdigkeit des Textes durch eine Zahl zwischen 0 und 100 ausdrücken, wobei 0 sehr mistrauisch ist und 100 sehr vertrauenswürdig ist.
            integer 5: Der Wert für "Gegenseitig" sollte durch eine Zahl zwischen 0 und 100 ausdrücken, wie einladend und offenherzig der Text für eine kollaboration ist, wobei 0 sehr abweisend ist und 100 sehr einladend ist.
            integer 6: Der Wert für "Nachhaltig" sollte durch eine Zahl zwischen 0 und 100 ausdrücken, wie bewust man mit Ressourcen umgeht, wobei 0 sehr verschwenderisch und 100 sehr bewust und sparspam ist.
            integer 7: Der Wert für "Inklusion" sollte durch eine Zahl zwischen 0 und 100 ausdrücken, wie Inklussiv der Text ist, wobei 0 bestimmte Menschen ausgrenzt und 100 alle einschliesst.
            integer 8: Der Wert für "Kommerziell" sollte durch eine Zahl zwischen 0 und 100 ausdrücken, wie sehr der Text profitorientiertes Wirtschaften ausdrückt, wobei 0 eine sehr bedürfnisorientiertes Wirtschaften und 100 sehr profitorientiertes Wirtschaften bedeutet.
            integer 9: Der Wert für "SozialesMiteinander" sollte durch eine Zahl zwischen 0 und 100 ausdrücken, wie sehr der Text Zusammenarbeit und Förderung von Beziehungen ausdrückt, wobei 0 asoziales Verhalten und 100 sehr soziales Verhalten ausdrückt.
            integer 10: Der Wert für "GleichrangigeSelbstOrganisation" sollte durch eine Zahl zwischen 0 und 100 ausdrücken, wie sehr der Text das Aushandeln auf Augenhöhe fördert, wobei 0 sehr Rangordnungsorientiert ist und 100 die Begenung auf Augenhöhe fördert.
            integer 11: Der Wert für "SorgendesSelbstbestimmtesWirtschaften" sollte durch eine Zahl zwischen 0 und 100 ausdrücken, wie sehr der Text sorgendes und selbstbestimmtes Wirtschaften ausdrückt, wobei 0 sehr fremdbestimmtes profititorientiertes Wirtschaften ist und 100 selbstbestimmtes und bedürfnisorientiertes Wirtschaften ausdrückt.
            Transcript: """
}
