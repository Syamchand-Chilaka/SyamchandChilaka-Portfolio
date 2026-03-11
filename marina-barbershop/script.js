(function () {
    "use strict";

    // ── Business Data ───────────────────────────────────────────────────
    var BUSINESS = {
        name: "Marina Barbershop",
        address: "865 Bergen Ave Ste 2, Jersey City, NJ 07306",
        phone: "(732) 476-8923"
    };

    var SERVICES = {
        haircut: { label: "A haircut", price: 25 },
        beard: { label: "A beard trim", price: 15 },
        both: { label: "A haircut and beard", price: 35 }
    };

    var HOURS = {
        sunday: "11:00 AM to 3:00 PM",
        monday: null,
        tuesday: null,
        wednesday: "Closed",
        thursday: null,
        friday: null,
        saturday: null
    };

    var GREETING = "Thank you for calling Marina Barbershop. How can I help you today?";

    // ── Booking State ───────────────────────────────────────────────────
    var booking = null;

    function resetBooking() {
        booking = {
            active: false,
            step: null,
            name: null,
            phone: null,
            service: null,
            date: null,
            time: null,
            barber: null,
            confirming: false
        };
    }
    resetBooking();

    // ── DOM References ──────────────────────────────────────────────────
    var messagesEl = document.getElementById("chatMessages");
    var inputEl = document.getElementById("chatInput");
    var sendBtn = document.getElementById("sendBtn");
    var typingEl = document.getElementById("typingIndicator");
    var chipContainer = document.querySelector(".quick-actions");

    // ── Helpers ─────────────────────────────────────────────────────────
    function scrollToBottom() {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function addMessage(text, role) {
        var div = document.createElement("div");
        div.className = "message " + role;
        var sender = document.createElement("div");
        sender.className = "sender";
        sender.textContent = role === "assistant" ? "Marina Barbershop" : "You";
        div.appendChild(sender);
        var body = document.createElement("div");
        body.textContent = text;
        div.appendChild(body);
        messagesEl.appendChild(div);
        scrollToBottom();
    }

    function showTyping() {
        typingEl.style.display = "block";
        scrollToBottom();
    }

    function hideTyping() {
        typingEl.style.display = "none";
    }

    function respond(text) {
        showTyping();
        var delay = 400 + Math.min(text.length * 8, 1200);
        setTimeout(function () {
            hideTyping();
            addMessage(text, "assistant");
        }, delay);
    }

    function lower(s) {
        return (s || "").toLowerCase().trim();
    }

    function contains(text, keywords) {
        var t = lower(text);
        for (var i = 0; i < keywords.length; i++) {
            if (t.indexOf(lower(keywords[i])) !== -1) return true;
        }
        return false;
    }

    // ── Price Logic ─────────────────────────────────────────────────────
    function matchService(text) {
        var t = lower(text);
        var hasCut = contains(t, ["haircut", "hair cut", "cut"]);
        var hasBeard = contains(t, ["beard", "shave", "trim"]);
        var hasBoth = contains(t, ["both", "combo", "haircut and beard", "cut and beard",
            "hair and beard", "haircut & beard", "cut & beard"]);

        if (hasBoth || (hasCut && hasBeard)) return "both";
        if (hasCut) return "haircut";
        if (hasBeard) return "beard";
        return null;
    }

    function handlePriceQuery(text) {
        var t = lower(text);
        if (!contains(t, ["price", "cost", "how much", "charge", "rate", "fee", "$"])) {
            return null;
        }
        var svc = matchService(text);
        if (svc) {
            var s = SERVICES[svc];
            return s.label + " is $" + s.price + ".";
        }
        return "A haircut is $25, a beard trim is $15, and a haircut and beard is $35.";
    }

    // ── Hours Logic ─────────────────────────────────────────────────────
    function handleHoursQuery(text) {
        var t = lower(text);
        if (!contains(t, ["hour", "open", "close", "when", "time", "schedule"])) {
            return null;
        }
        var dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        var today = dayNames[new Date().getDay()];
        var requestedDay = null;

        for (var i = 0; i < dayNames.length; i++) {
            if (t.indexOf(dayNames[i]) !== -1) {
                requestedDay = dayNames[i];
                break;
            }
        }
        if (contains(t, ["today"])) {
            requestedDay = today;
        }
        if (contains(t, ["tomorrow"])) {
            var tmrIdx = (new Date().getDay() + 1) % 7;
            requestedDay = dayNames[tmrIdx];
        }

        if (requestedDay) {
            var h = HOURS[requestedDay];
            var dayLabel = requestedDay.charAt(0).toUpperCase() + requestedDay.slice(1);
            if (h === "Closed") {
                return "Marina Barbershop is closed on " + dayLabel + ".";
            }
            if (h) {
                return "On " + dayLabel + ", Marina Barbershop is open from " + h + ".";
            }
            return "Please call Marina Barbershop directly at " + BUSINESS.phone + " to confirm " + dayLabel + "'s hours.";
        }

        return "I can share the hours I have. Marina Barbershop is closed on Wednesday and open Sunday from 11 AM to 3 PM. For other days, please call Marina Barbershop directly at " + BUSINESS.phone + " to confirm the hours.";
    }

    // ── Location Logic ──────────────────────────────────────────────────
    function handleLocationQuery(text) {
        if (!contains(text, ["where", "location", "address", "direction", "find you", "located"])) {
            return null;
        }
        return "We're located at " + BUSINESS.address + ".";
    }

    // ── Walk-in Logic ───────────────────────────────────────────────────
    function handleWalkInQuery(text) {
        if (!contains(text, ["walk-in", "walkin", "walk in", "without appointment", "drop in"])) {
            return null;
        }
        return "Walk-ins may be available depending on how busy the shop is.";
    }

    // ── Booking Flow ────────────────────────────────────────────────────
    function startBooking() {
        resetBooking();
        booking.active = true;
        booking.step = "name";
    }

    function extractPhone(text) {
        var digits = text.replace(/\D/g, "");
        if (digits.length >= 7) return digits;
        return null;
    }

    function extractDetailsFromText(text) {
        var svc = matchService(text);
        if (svc) booking.service = SERVICES[svc].label;

        var phoneCandidate = extractPhone(text);
        if (phoneCandidate) booking.phone = phoneCandidate;
    }

    function handleBookingStep(text) {
        if (!booking.active) return null;

        if (booking.confirming) {
            if (contains(text, ["yes", "yep", "yeah", "confirm", "correct", "sure", "right"])) {
                var summary = "Your appointment request has been submitted, and Marina Barbershop will confirm it soon.";
                resetBooking();
                return summary;
            }
            if (contains(text, ["no", "nope", "cancel", "wrong", "not right"])) {
                resetBooking();
                return "No problem. Let me know if you'd like to start over.";
            }
            return "Could you confirm with a yes or no?";
        }

        switch (booking.step) {
            case "name":
                booking.name = text.trim();
                booking.step = "phone";
                return "Thank you, " + booking.name + ". What's your phone number?";

            case "phone":
                var phone = extractPhone(text);
                if (!phone) {
                    return "I didn't catch a phone number. Could you provide a valid phone number?";
                }
                booking.phone = phone;
                booking.step = "service";
                return "Got it. What service would you like? We offer haircuts ($25), beard trims ($15), or both ($35).";

            case "service":
                var svc = matchService(text);
                if (!svc) {
                    return "I didn't catch the service. We offer haircuts, beard trims, or a haircut and beard combo. Which would you like?";
                }
                booking.service = SERVICES[svc].label;
                booking.step = "date";
                return "Great choice. What date works for you?";

            case "date":
                booking.date = text.trim();
                booking.step = "time";
                return "And what time would you prefer?";

            case "time":
                booking.time = text.trim();
                booking.step = "barber";
                return "Do you have a preferred barber, or anyone is fine?";

            case "barber":
                var t = lower(text);
                if (contains(t, ["anyone", "any", "no preference", "don't care", "doesn't matter", "no", "none", "nope"])) {
                    booking.barber = "No preference";
                } else {
                    booking.barber = text.trim();
                }
                booking.confirming = true;
                return "Let me confirm your appointment request:\n" +
                    "• Name: " + booking.name + "\n" +
                    "• Phone: " + booking.phone + "\n" +
                    "• Service: " + booking.service + "\n" +
                    "• Date: " + booking.date + "\n" +
                    "• Time: " + booking.time + "\n" +
                    "• Barber: " + booking.barber + "\n\n" +
                    "Does everything look correct?";

            default:
                return null;
        }
    }

    // ── Detect Booking Intent ───────────────────────────────────────────
    function wantsToBook(text) {
        return contains(text, ["book", "appointment", "schedule", "reserve"]);
    }

    function hasInlineDetails(text) {
        return contains(text, ["tomorrow", "today", "monday", "tuesday", "wednesday",
            "thursday", "friday", "saturday", "sunday",
            "am", "pm", "morning", "afternoon", "evening"]);
    }

    // ── Main Router ─────────────────────────────────────────────────────
    function getResponse(text) {
        // Active booking flow takes priority
        if (booking.active) {
            return handleBookingStep(text);
        }

        // Price queries
        var price = handlePriceQuery(text);
        if (price) return price;

        // Hours queries
        var hours = handleHoursQuery(text);
        if (hours) return hours;

        // Location
        var loc = handleLocationQuery(text);
        if (loc) return loc;

        // Walk-ins
        var walkin = handleWalkInQuery(text);
        if (walkin) return walkin;

        // Booking intent
        if (wantsToBook(text)) {
            if (hasInlineDetails(text)) {
                extractDetailsFromText(text);
                startBooking();
                if (booking.name) {
                    booking.step = "phone";
                    return "Sure. May I have your phone number for the appointment?";
                }
                return "Sure, I can help with that. May I have your full name?";
            }
            startBooking();
            return "Sure, I can help with that. May I have your full name?";
        }

        // Service query without price keyword
        var svcMatch = matchService(text);
        if (svcMatch && contains(text, ["offer", "do you", "available", "service", "provide", "have"])) {
            var s = SERVICES[svcMatch];
            return s.label + " is $" + s.price + ".";
        }

        // General services question
        if (contains(text, ["service", "menu", "offer", "what do you"])) {
            return "We offer haircuts ($25), beard trims ($15), and a haircut and beard combo ($35).";
        }

        // Phone number query
        if (contains(text, ["phone", "number", "call", "contact"])) {
            return "You can reach Marina Barbershop at " + BUSINESS.phone + ".";
        }

        // Thanks
        if (contains(text, ["thank", "thanks", "appreciate"])) {
            return "You're welcome! Is there anything else I can help with?";
        }

        // Goodbye
        if (contains(text, ["bye", "goodbye", "see you", "that's all", "that is all"])) {
            return "Thanks for calling Marina Barbershop. Have a great day!";
        }

        // Greeting
        if (contains(text, ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"])) {
            return GREETING;
        }

        // Fallback
        return "I'm not sure about that. You can call Marina Barbershop directly at " + BUSINESS.phone + " for more details.";
    }

    // ── Event Handlers ──────────────────────────────────────────────────
    function handleSend() {
        var text = inputEl.value.trim();
        if (!text) return;
        addMessage(text, "user");
        inputEl.value = "";
        var reply = getResponse(text);
        respond(reply);
    }

    sendBtn.addEventListener("click", handleSend);

    inputEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    });

    // Quick action chips
    if (chipContainer) {
        chipContainer.addEventListener("click", function (e) {
            if (e.target.classList.contains("quick-chip")) {
                var text = e.target.getAttribute("data-msg");
                if (text) {
                    inputEl.value = text;
                    handleSend();
                }
            }
        });
    }

    // ── Initial Greeting ────────────────────────────────────────────────
    setTimeout(function () {
        addMessage(GREETING, "assistant");
    }, 500);

})();
