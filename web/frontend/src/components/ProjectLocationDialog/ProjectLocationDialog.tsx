import { useEffect, useState, useRef, useCallback } from "react";
import { X, ChevronDown, MapPin, Search } from "lucide-react";

// ─── All station data from the SQL schema ───────────────────────────────────
const STATIONS_DATA = [
  { state: "Andaman and Nicobar Island", station: "Car-Nicobar", lat: 9.1527, lng: 92.8197 },
  { state: "Andaman and Nicobar Island", station: "Hut Bay", lat: 10.6, lng: 92.55 },
  { state: "Andaman and Nicobar Island", station: "Kondul", lat: 7.2333, lng: 93.7667 },
  { state: "Andaman and Nicobar Island", station: "Long Island", lat: 12.4, lng: 92.9667 },
  { state: "Andaman and Nicobar Island", station: "Mayabandar", lat: 12.9167, lng: 92.9 },
  { state: "Andaman and Nicobar Island", station: "Nancowry", lat: 7.9833, lng: 93.5333 },
  { state: "Andaman and Nicobar Island", station: "Port Blair", lat: 11.6234, lng: 92.7265 },
  { state: "Andhra Pradesh", station: "Anantapur", lat: 14.6819, lng: 77.6006 },
  { state: "Andhra Pradesh", station: "Arogyavaram", lat: 13.6154, lng: 79.4236 },
  { state: "Andhra Pradesh", station: "Bapatla", lat: 15.9047, lng: 80.4672 },
  { state: "Andhra Pradesh", station: "Cuddapah", lat: 14.4673, lng: 78.8242 },
  { state: "Andhra Pradesh", station: "Dolphine Nose/CDR Visakhapatnam", lat: 17.7041, lng: 83.3007 },
  { state: "Andhra Pradesh", station: "Gannavaram (A)", lat: 16.5304, lng: 80.7978 },
  { state: "Andhra Pradesh", station: "Kakinada", lat: 16.9891, lng: 82.2475 },
  { state: "Andhra Pradesh", station: "Kalingapatanam", lat: 18.33, lng: 84.13 },
  { state: "Andhra Pradesh", station: "Kavali", lat: 14.9167, lng: 79.9833 },
  { state: "Andhra Pradesh", station: "Kurnool", lat: 15.8281, lng: 78.0373 },
  { state: "Andhra Pradesh", station: "Masulipatnam", lat: 16.1859, lng: 81.1514 },
  { state: "Andhra Pradesh", station: "Nellore", lat: 14.4426, lng: 79.9865 },
  { state: "Andhra Pradesh", station: "Vijayawada", lat: 16.5062, lng: 80.648 },
  { state: "Andhra Pradesh", station: "Vishakhapatnam", lat: 17.6868, lng: 83.2185 },
  { state: "Arunachal Pradesh", station: "Pasighat", lat: 28.0667, lng: 95.3333 },
  { state: "Assam", station: "Dhubri (Rupsi) (A)", lat: 26.02, lng: 89.98 },
  { state: "Assam", station: "Dibrugarh (Mohanbari) (A)", lat: 27.4839, lng: 95.0169 },
  { state: "Assam", station: "Guwahati (Bhorjar) (A)", lat: 26.1061, lng: 91.5859 },
  { state: "Assam", station: "Jorhat", lat: 26.7509, lng: 94.2037 },
  { state: "Assam", station: "North Lakhimpur", lat: 27.2361, lng: 94.1069 },
  { state: "Assam", station: "Silchar", lat: 24.8333, lng: 92.7789 },
  { state: "Assam", station: "Tezpur", lat: 26.6338, lng: 92.8 },
  { state: "Bihar", station: "Bhagalpur", lat: 25.2425, lng: 86.9842 },
  { state: "Bihar", station: "Chapra", lat: 25.7839, lng: 84.7411 },
  { state: "Bihar", station: "Darbhanga", lat: 26.1542, lng: 85.8918 },
  { state: "Bihar", station: "Gaya", lat: 24.7914, lng: 85.0002 },
  { state: "Bihar", station: "Jamshedpur", lat: 22.8046, lng: 86.2029 },
  { state: "Bihar", station: "Muzaffarpur", lat: 26.1225, lng: 85.3906 },
  { state: "Bihar", station: "Patna (A)", lat: 25.5941, lng: 85.0919 },
  { state: "Bihar", station: "Raipur", lat: 21.2514, lng: 81.6296 },
  { state: "Bihar", station: "Ranchi(A)", lat: 23.3441, lng: 85.3096 },
  { state: "Chhattisgarh", station: "Bhilai", lat: 21.2167, lng: 81.4333 },
  { state: "Daman & Diu", station: "Diu", lat: 20.7144, lng: 70.9874 },
  { state: "Goa", station: "Dabolim (N.A.S.)", lat: 15.3808, lng: 73.8314 },
  { state: "Goa", station: "Marmugao", lat: 15.4089, lng: 73.8006 },
  { state: "Goa", station: "Panjim", lat: 15.4909, lng: 73.8278 },
  { state: "Gujarat", station: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { state: "Gujarat", station: "Amreli", lat: 21.603, lng: 71.2163 },
  { state: "Gujarat", station: "Baroda", lat: 22.3072, lng: 73.1812 },
  { state: "Gujarat", station: "Bhavnagar (A)", lat: 21.7645, lng: 72.1519 },
  { state: "Gujarat", station: "Bhuj (Rudramata) (A)", lat: 23.2419, lng: 69.6669 },
  { state: "Gujarat", station: "Deesa", lat: 24.2575, lng: 72.1908 },
  { state: "Gujarat", station: "Dwarka", lat: 22.2442, lng: 68.9685 },
  { state: "Gujarat", station: "Keshod (A)", lat: 21.3167, lng: 70.25 },
  { state: "Gujarat", station: "New Kandla", lat: 23.0333, lng: 70.2167 },
  { state: "Gujarat", station: "Okha", lat: 22.4672, lng: 69.07 },
  { state: "Gujarat", station: "Porbandar (A)", lat: 21.6417, lng: 69.6293 },
  { state: "Gujarat", station: "Rajkot (A)", lat: 22.3039, lng: 70.8022 },
  { state: "Gujarat", station: "Surat", lat: 21.1702, lng: 72.8311 },
  { state: "Gujarat", station: "Vadodara", lat: 22.3072, lng: 73.1812 },
  { state: "Gujarat", station: "Veraval", lat: 20.9158, lng: 70.3629 },
  { state: "Haryana", station: "Ambala", lat: 30.3782, lng: 76.7767 },
  { state: "Haryana", station: "Bhiwani", lat: 28.7872, lng: 76.1322 },
  { state: "Haryana", station: "Gurgaon", lat: 28.4595, lng: 77.0266 },
  { state: "Haryana", station: "Hissar", lat: 29.1492, lng: 75.7217 },
  { state: "Haryana", station: "Karnal", lat: 29.6857, lng: 76.9905 },
  { state: "Haryana", station: "Rohtak", lat: 28.8955, lng: 76.6066 },
  { state: "Himachal Pradesh", station: "Bhuntar (A)", lat: 31.8776, lng: 77.1544 },
  { state: "Himachal Pradesh", station: "Dharamshala", lat: 32.219, lng: 76.3234 },
  { state: "Himachal Pradesh", station: "Kalpa (GL)", lat: 31.5333, lng: 78.25 },
  { state: "Himachal Pradesh", station: "Manali", lat: 32.2396, lng: 77.1887 },
  { state: "Himachal Pradesh", station: "Shimla", lat: 31.1048, lng: 77.1734 },
  { state: "Himachal Pradesh", station: "Una", lat: 31.4685, lng: 76.2708 },
  { state: "Jammu and Kashmir", station: "Gulmarg", lat: 34.05, lng: 74.38 },
  { state: "Jammu and Kashmir", station: "Jammu", lat: 32.7266, lng: 74.857 },
  { state: "Jammu and Kashmir", station: "Kathua", lat: 32.3861, lng: 75.5194 },
  { state: "Jammu and Kashmir", station: "Kupwara", lat: 34.5167, lng: 74.25 },
  { state: "Jammu and Kashmir", station: "Pehalgam", lat: 34.0167, lng: 75.3167 },
  { state: "Jammu and Kashmir", station: "Srinagar", lat: 34.0837, lng: 74.7973 },
  { state: "Jharkhand", station: "Bokaro", lat: 23.6693, lng: 86.1511 },
  { state: "Karnataka", station: "Bagalkote", lat: 16.1716, lng: 75.6602 },
  { state: "Karnataka", station: "Bangalore (A)", lat: 12.9499, lng: 77.6853 },
  { state: "Karnataka", station: "Belgaum", lat: 15.8497, lng: 74.4977 },
  { state: "Karnataka", station: "Bellary", lat: 15.1394, lng: 76.9214 },
  { state: "Karnataka", station: "Bijapur", lat: 16.8302, lng: 75.71 },
  { state: "Karnataka", station: "Chickmagalur", lat: 13.3161, lng: 75.772 },
  { state: "Karnataka", station: "Dharwad", lat: 15.4589, lng: 75.0078 },
  { state: "Karnataka", station: "Gulbarga", lat: 17.3297, lng: 76.8343 },
  { state: "Karnataka", station: "Karwar", lat: 14.8137, lng: 74.1294 },
  { state: "Karnataka", station: "Mangalore (Bajpe) (A)", lat: 12.9141, lng: 74.883 },
  { state: "Karnataka", station: "Mysuru", lat: 12.2958, lng: 76.6394 },
  { state: "Karnataka", station: "Raichur", lat: 16.212, lng: 77.3439 },
  { state: "Karnataka", station: "Shimoga", lat: 13.9299, lng: 75.5681 },
  { state: "Kerala", station: "Alleppy (Alappuzha)", lat: 9.4981, lng: 76.3388 },
  { state: "Kerala", station: "Calicut (Kozhikode)", lat: 11.2588, lng: 75.7804 },
  { state: "Kerala", station: "Cannanore (Kannur)", lat: 11.8745, lng: 75.3704 },
  { state: "Kerala", station: "Cochin (N.A.S.)/ Kochi", lat: 9.9312, lng: 76.2673 },
  { state: "Kerala", station: "Karipur (Airport)", lat: 11.1367, lng: 75.9509 },
  { state: "Kerala", station: "Kottayam", lat: 9.5916, lng: 76.5222 },
  { state: "Kerala", station: "Palakkad (Palghat)", lat: 10.7867, lng: 76.6548 },
  { state: "Kerala", station: "Thiruvananthapuram", lat: 8.5241, lng: 76.9366 },
  { state: "Lakshadweep Island", station: "Amini Divi", lat: 10.1167, lng: 72.7333 },
  { state: "Lakshadweep Island", station: "Minicoy", lat: 8.2833, lng: 73.05 },
  { state: "Madhya Pradesh", station: "Bhopal (Bairagarh)", lat: 23.2599, lng: 77.4126 },
  { state: "Madhya Pradesh", station: "Gwalior", lat: 26.2183, lng: 78.1828 },
  { state: "Madhya Pradesh", station: "Indore", lat: 22.7196, lng: 75.8577 },
  { state: "Madhya Pradesh", station: "Jabalpur", lat: 23.1815, lng: 79.9864 },
  { state: "Madhya Pradesh", station: "Khajuraho", lat: 24.8318, lng: 79.9199 },
  { state: "Madhya Pradesh", station: "Rewa", lat: 24.5333, lng: 81.3 },
  { state: "Madhya Pradesh", station: "Sagar", lat: 23.8388, lng: 78.7378 },
  { state: "Madhya Pradesh", station: "Ujjain", lat: 23.1765, lng: 75.7885 },
  { state: "Maharashtra", station: "Ahmednagar", lat: 19.0948, lng: 74.748 },
  { state: "Maharashtra", station: "Akola", lat: 20.7059, lng: 77.0048 },
  { state: "Maharashtra", station: "Alibagh", lat: 18.6414, lng: 72.8724 },
  { state: "Maharashtra", station: "Amravati", lat: 20.9333, lng: 77.75 },
  { state: "Maharashtra", station: "Aurangabad (Chikalthana) (A)", lat: 19.8625, lng: 75.3984 },
  { state: "Maharashtra", station: "Chandrapur (Chanda)", lat: 19.95, lng: 79.3 },
  { state: "Maharashtra", station: "Kolhapur", lat: 16.705, lng: 74.2433 },
  { state: "Maharashtra", station: "Mahabaleshwar", lat: 17.9256, lng: 73.656 },
  { state: "Maharashtra", station: "Mumbai (Colaba)", lat: 18.9067, lng: 72.8147 },
  { state: "Maharashtra", station: "Mumbai(Bombay) (Santa Cruz)", lat: 19.076, lng: 72.8777 },
  { state: "Maharashtra", station: "Nagpur (Sonegaon)", lat: 21.092, lng: 79.0481 },
  { state: "Maharashtra", station: "Nashik", lat: 19.9975, lng: 73.7898 },
  { state: "Maharashtra", station: "Pune", lat: 18.5204, lng: 73.8567 },
  { state: "Manipur", station: "Imphal", lat: 24.817, lng: 93.9368 },
  { state: "Meghalaya", station: "Cherrapunji", lat: 25.2833, lng: 91.7167 },
  { state: "Meghalaya", station: "Shillong (C.S.O.)", lat: 25.5788, lng: 91.8933 },
  { state: "Mizoram", station: "Aizwal", lat: 23.7271, lng: 92.7176 },
  { state: "Nagaland", station: "Kohima", lat: 25.6701, lng: 94.1089 },
  { state: "New Delhi", station: "(Safdarjang)", lat: 28.5847, lng: 77.2088 },
  { state: "New Delhi", station: "Delhi", lat: 28.6139, lng: 77.209 },
  { state: "New Delhi", station: "New Delhi Palam (A)", lat: 28.5562, lng: 77.1 },
  { state: "Odisha", station: "Bhubaneswar", lat: 20.2961, lng: 85.8245 },
  { state: "Odisha", station: "Bhubaneshwar (A)", lat: 20.2552, lng: 85.8148 },
  { state: "Odisha", station: "Cuttack", lat: 20.4625, lng: 85.883 },
  { state: "Odisha", station: "Puri", lat: 19.8135, lng: 85.8312 },
  { state: "Odisha", station: "Rourkela", lat: 22.2604, lng: 84.8536 },
  { state: "Odisha", station: "Sambalpur", lat: 21.4669, lng: 83.9812 },
  { state: "Pondicherry", station: "Pondicherry", lat: 11.9416, lng: 79.8083 },
  { state: "Punjab", station: "Amritsar (Rajasansi)", lat: 31.7092, lng: 74.7974 },
  { state: "Punjab", station: "Bhatinda", lat: 30.211, lng: 74.9455 },
  { state: "Punjab", station: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  { state: "Punjab", station: "Ludhiana", lat: 30.901, lng: 75.8573 },
  { state: "Punjab", station: "Patiala", lat: 30.3398, lng: 76.3869 },
  { state: "Rajasthan", station: "Abu", lat: 24.5925, lng: 72.7083 },
  { state: "Rajasthan", station: "Ajmer", lat: 26.4499, lng: 74.6399 },
  { state: "Rajasthan", station: "Bikaner(P.B.O)", lat: 28.0229, lng: 73.3119 },
  { state: "Rajasthan", station: "Jaipur (Sanganer)", lat: 26.823, lng: 75.8074 },
  { state: "Rajasthan", station: "Jaisalmer", lat: 26.9157, lng: 70.9083 },
  { state: "Rajasthan", station: "Jodhpur", lat: 26.2389, lng: 73.0243 },
  { state: "Rajasthan", station: "Kota (A)", lat: 25.18, lng: 75.8648 },
  { state: "Rajasthan", station: "Udaipur", lat: 24.5854, lng: 73.7125 },
  { state: "Sikkim", station: "Gangtok", lat: 27.3389, lng: 88.6065 },
  { state: "Tamil Nadu", station: "Chennai (Minambakkam) (A)", lat: 12.9855, lng: 80.1689 },
  { state: "Tamil Nadu", station: "Chennai (Nungambakkam)", lat: 13.0569, lng: 80.2425 },
  { state: "Tamil Nadu", station: "Coimbatore (Pilamedu)", lat: 11.0168, lng: 76.9558 },
  { state: "Tamil Nadu", station: "Cuddalore", lat: 11.748, lng: 79.7714 },
  { state: "Tamil Nadu", station: "Kodaikanal", lat: 10.2381, lng: 77.4892 },
  { state: "Tamil Nadu", station: "Madurai", lat: 9.9252, lng: 78.1198 },
  { state: "Tamil Nadu", station: "Nagapattinam", lat: 10.7667, lng: 79.85 },
  { state: "Tamil Nadu", station: "Salem", lat: 11.6643, lng: 78.146 },
  { state: "Tamil Nadu", station: "Tiruchi", lat: 10.7905, lng: 78.7047 },
  { state: "Tamil Nadu", station: "Vellore", lat: 12.9165, lng: 79.1325 },
  { state: "Telangana", station: "Bhadrachallam", lat: 17.6683, lng: 80.8903 },
  { state: "Telangana", station: "Hanamkonda", lat: 17.9854, lng: 79.5603 },
  { state: "Telangana", station: "Hyderabad (A)", lat: 17.2403, lng: 78.4294 },
  { state: "Telangana", station: "Khammam", lat: 17.2473, lng: 80.1514 },
  { state: "Telangana", station: "Nizamabad", lat: 18.6725, lng: 78.0941 },
  { state: "Tripura", station: "Agartala (A)", lat: 23.8871, lng: 91.25 },
  { state: "Uttar Pradesh", station: "Agra", lat: 27.1767, lng: 78.0081 },
  { state: "Uttar Pradesh", station: "Aligarh", lat: 27.8974, lng: 78.088 },
  { state: "Uttar Pradesh", station: "Allahabad", lat: 25.4358, lng: 81.8463 },
  { state: "Uttar Pradesh", station: "Bareilly", lat: 28.367, lng: 79.4304 },
  { state: "Uttar Pradesh", station: "Gorakhpur (P.B.O)", lat: 26.7606, lng: 83.3732 },
  { state: "Uttar Pradesh", station: "Jhansi", lat: 25.4484, lng: 78.5685 },
  { state: "Uttar Pradesh", station: "Kanpur (A)", lat: 26.4725, lng: 80.3311 },
  { state: "Uttar Pradesh", station: "Lucknow (Amausi)", lat: 26.7606, lng: 80.8893 },
  { state: "Uttar Pradesh", station: "Varanasi", lat: 25.3176, lng: 82.9739 },
  { state: "Uttarakhand", station: "Almora", lat: 29.5971, lng: 79.6591 },
  { state: "Uttarakhand", station: "Dehra Dun", lat: 30.3165, lng: 78.0322 },
  { state: "Uttarakhand", station: "Nainital", lat: 29.3919, lng: 79.4542 },
  { state: "Uttarakhand", station: "Roorkee", lat: 29.8543, lng: 77.888 },
  { state: "West Bengal", station: "Asansol", lat: 23.6833, lng: 86.9667 },
  { state: "West Bengal", station: "Bankura", lat: 23.2345, lng: 87.0674 },
  { state: "West Bengal", station: "Calcutta (Alipur)", lat: 22.5333, lng: 88.3333 },
  { state: "West Bengal", station: "Calcutta (Dum Dum) (A)", lat: 22.65, lng: 88.45 },
  { state: "West Bengal", station: "Darjeeling", lat: 27.036, lng: 88.2627 },
  { state: "West Bengal", station: "Durgapur", lat: 23.5204, lng: 87.3119 },
  { state: "West Bengal", station: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { state: "West Bengal", station: "Malda", lat: 25.0167, lng: 88.1333 },
];

// Temperature data keyed by "state|station"
const TEMP_DATA = {
  "Andaman and Nicobar Island|Port Blair": { max: 36.4, min: 14.6 },
  "Andhra Pradesh|Dolphine Nose/CDR Visakhapatnam": { max: 42.8, min: 14.1 },
  "Andhra Pradesh|Kurnool": { max: 45.6, min: 6.7 },
  "Andhra Pradesh|Masulipatnam": { max: 47.8, min: 13.2 },
  "Andhra Pradesh|Nellore": { max: 46.7, min: 11.1 },
  "Andhra Pradesh|Vijayawada": { max: null, min: null },
  "Andhra Pradesh|Vishakhapatnam": { max: 45.4, min: 10.5 },
  "Assam|Guwahati (Bhorjar) (A)": { max: 40.3, min: 3.0 },
  "Assam|Tezpur": { max: 45.7, min: 5.6 },
  "Bihar|Gaya": { max: 49.0, min: 1.2 },
  "Bihar|Jamshedpur": { max: 47.7, min: 3.9 },
  "Bihar|Patna (A)": { max: 46.6, min: 1.4 },
  "Bihar|Raipur": { max: 47.9, min: 3.9 },
  "Bihar|Ranchi(A)": { max: 43.4, min: 0.6 },
  "Chhattisgarh|Bhilai": { max: null, min: null },
  "Goa|Panjim": { max: 39.8, min: 3.4 },
  "Gujarat|Ahmedabad": { max: 47.8, min: 2.2 },
  "Gujarat|Bhuj (Rudramata) (A)": { max: 47.8, min: -0.2 },
  "Gujarat|Rajkot (A)": { max: 47.9, min: -0.6 },
  "Gujarat|Surat": { max: 45.6, min: 4.4 },
  "Gujarat|Vadodara": { max: null, min: null },
  "Haryana|Ambala": { max: 47.8, min: -1.3 },
  "Haryana|Gurgaon": { max: 49.0, min: -0.4 },
  "Himachal Pradesh|Kalpa (GL)": { max: 32.4, min: -15.5 },
  "Himachal Pradesh|Mandi": { max: null, min: null },
  "Himachal Pradesh|Shimla": { max: 32.4, min: -12.2 },
  "Himachal Pradesh|Una": { max: 45.2, min: -5.8 },
  "Jammu and Kashmir|Srinagar": { max: null, min: null },
  "Jharkhand|Bokaro": { max: null, min: null },
  "Karnataka|Bangalore (A)": { max: 38.3, min: 8.8 },
  "Karnataka|Dharwad": { max: null, min: null },
  "Karnataka|Gulbarga": { max: 46.1, min: 5.6 },
  "Karnataka|Karwar": { max: 39.6, min: 11.6 },
  "Karnataka|Mangalore (Bajpe) (A)": { max: 39.8, min: 15.9 },
  "Karnataka|Mysuru": { max: null, min: null },
  "Kerala|Calicut (Kozhikode)": { max: null, min: null },
  "Kerala|Cochin (N.A.S.)/ Kochi": { max: 36.5, min: 16.3 },
  "Kerala|Thiruvananthapuram": { max: null, min: null },
  "Madhya Pradesh|Bhopal (Bairagarh)": { max: 46.0, min: 0.6 },
  "Madhya Pradesh|Jabalpur": { max: 46.7, min: 0.0 },
  "Madhya Pradesh|Sagar": { max: 46.4, min: 1.1 },
  "Maharashtra|Aurangabad (Chikalthana) (A)": { max: 43.6, min: 1.2 },
  "Maharashtra|Mumbai (Colaba)": { max: 40.6, min: 11.7 },
  "Maharashtra|Mumbai(Bombay) (Santa Cruz)": { max: 42.2, min: 7.4 },
  "Maharashtra|Nagpur (Sonegaon)": { max: 47.8, min: 3.9 },
  "Maharashtra|Nashik": { max: null, min: null },
  "Maharashtra|Pune": { max: 43.3, min: 1.7 },
  "Manipur|Imphal": { max: null, min: null },
  "Meghalaya|Shillong (C.S.O.)": { max: 30.2, min: -3.3 },
  "Nagaland|Kohima": { max: null, min: null },
  "New Delhi|(Safdarjang)": { max: 47.2, min: -0.6 },
  "New Delhi|Delhi": { max: null, min: null },
  "New Delhi|New Delhi Palam (A)": { max: 48.4, min: -2.2 },
  "Odisha|Bhubaneswar": { max: null, min: null },
  "Odisha|Cuttack": { max: 47.7, min: 5.8 },
  "Odisha|Puri": { max: 44.2, min: 7.5 },
  "Odisha|Rourkela": { max: null, min: null },
  "Pondicherry|Pondicherry": { max: 45.5, min: 15.1 },
  "Punjab|Amritsar (Rajasansi)": { max: 47.8, min: -3.6 },
  "Punjab|Chandigarh": { max: null, min: null },
  "Punjab|Ludhiana": { max: 46.6, min: -1.7 },
  "Punjab|Patiala": { max: 47.0, min: -0.9 },
  "Rajasthan|Ajmer": { max: 47.4, min: -2.8 },
  "Rajasthan|Bikaner(P.B.O)": { max: 49.4, min: -4.0 },
  "Rajasthan|Jaipur (Sanganer)": { max: 49.0, min: -2.2 },
  "Rajasthan|Jodhpur": { max: null, min: null },
  "Rajasthan|Kota (A)": { max: 48.5, min: 1.8 },
  "Rajasthan|Udaipur": { max: 44.6, min: 0.4 },
  "Sikkim|Gangtok": { max: 29.9, min: -2.2 },
  "Tamil Nadu|Chennai (Minambakkam) (A)": { max: 49.1, min: 15.7 },
  "Tamil Nadu|Chennai (Nungambakkam)": { max: 45.0, min: 13.9 },
  "Tamil Nadu|Coimbatore (Pilamedu)": { max: 42.6, min: 12.2 },
  "Tamil Nadu|Madurai": { max: 44.5, min: 10.5 },
  "Tamil Nadu|Salem": { max: 42.8, min: 11.1 },
  "Tamil Nadu|Tiruchi": { max: 42.4, min: 16.0 },
  "Tamil Nadu|Vellore": { max: 45.0, min: 8.4 },
  "Telangana|Bhadrachallam": { max: 49.4, min: 8.4 },
  "Telangana|Hyderabad (A)": { max: 45.5, min: 6.1 },
  "Uttar Pradesh|Agra": { max: 48.6, min: -2.2 },
  "Uttar Pradesh|Allahabad": { max: 48.8, min: -0.7 },
  "Uttar Pradesh|Lucknow (Amausi)": { max: 47.7, min: -1.0 },
  "Uttar Pradesh|Varanasi": { max: 47.2, min: 1.0 },
  "Uttarakhand|Dehra Dun": { max: 43.9, min: -1.1 },
  "Uttarakhand|Nainital": { max: null, min: null },
  "Uttarakhand|Roorkee": { max: 47.4, min: -2.2 },
  "West Bengal|Calcutta (Alipur)": { max: 43.9, min: 6.7 },
  "West Bengal|Darjeeling": { max: 28.5, min: -7.2 },
  "West Bengal|Kolkata": { max: null, min: null },
};

// Zone data keyed by "state|station"
const ZONE_DATA = {
  "Andhra Pradesh|Dolphine Nose/CDR Visakhapatnam": { zone: "IV", z: "0.24" },
  "Andhra Pradesh|Kurnool": { zone: "II", z: "0.10" },
  "Andhra Pradesh|Masulipatnam": { zone: "IV", z: "0.24" },
  "Andhra Pradesh|Nellore": { zone: "III", z: "0.16" },
  "Andhra Pradesh|Vijayawada": { zone: "III", z: "0.16" },
  "Andhra Pradesh|Vishakhapatnam": { zone: "II", z: "0.10" },
  "Assam|Guwahati (Bhorjar) (A)": { zone: "V", z: "0.36" },
  "Bihar|Gaya": { zone: "III", z: "0.16" },
  "Bihar|Jamshedpur": { zone: "II", z: "0.10" },
  "Bihar|Patna (A)": { zone: "IV", z: "0.24" },
  "Bihar|Raipur": { zone: "II", z: "0.10" },
  "Bihar|Ranchi(A)": { zone: "II", z: "0.10" },
  "Chhattisgarh|Bhilai": { zone: "II", z: "0.10" },
  "Goa|Panjim": { zone: "III", z: "0.16" },
  "Gujarat|Ahmedabad": { zone: "III", z: "0.16" },
  "Gujarat|Bhuj (Rudramata) (A)": { zone: "V", z: "0.36" },
  "Gujarat|Rajkot (A)": { zone: "III", z: "0.16" },
  "Gujarat|Surat": { zone: "III", z: "0.16" },
  "Gujarat|Vadodara": { zone: "III", z: "0.16" },
  "Haryana|Ambala": { zone: "IV", z: "0.24" },
  "Himachal Pradesh|Kalpa (GL)": { zone: "III", z: "0.16" },
  "Himachal Pradesh|Mandi": { zone: "V", z: "0.36" },
  "Himachal Pradesh|Shimla": { zone: "IV", z: "0.24" },
  "Himachal Pradesh|Una": { zone: "II", z: "0.10" },
  "Jammu and Kashmir|Srinagar": { zone: "V", z: "0.36" },
  "Jharkhand|Bokaro": { zone: "III", z: "0.16" },
  "Karnataka|Bangalore (A)": { zone: "II", z: "0.10" },
  "Karnataka|Dharwad": { zone: "III", z: "0.16" },
  "Karnataka|Gulbarga": { zone: "II", z: "0.10" },
  "Karnataka|Karwar": { zone: "III", z: "0.16" },
  "Karnataka|Mangalore (Bajpe) (A)": { zone: "III", z: "0.16" },
  "Karnataka|Mysuru": { zone: "II", z: "0.10" },
  "Kerala|Calicut (Kozhikode)": { zone: "III", z: "0.16" },
  "Kerala|Cochin (N.A.S.)/ Kochi": { zone: "III", z: "0.16" },
  "Kerala|Thiruvananthapuram": { zone: "III", z: "0.16" },
  "Madhya Pradesh|Bhopal (Bairagarh)": { zone: "II", z: "0.10" },
  "Madhya Pradesh|Jabalpur": { zone: "III", z: "0.16" },
  "Madhya Pradesh|Sagar": { zone: "II", z: "0.10" },
  "Maharashtra|Aurangabad (Chikalthana) (A)": { zone: "II", z: "0.10" },
  "Maharashtra|Mumbai (Colaba)": { zone: "III", z: "0.16" },
  "Maharashtra|Mumbai(Bombay) (Santa Cruz)": { zone: "III", z: "0.16" },
  "Maharashtra|Nagpur (Sonegaon)": { zone: "II", z: "0.10" },
  "Maharashtra|Nashik": { zone: "III", z: "0.16" },
  "Maharashtra|Pune": { zone: "III", z: "0.16" },
  "Manipur|Imphal": { zone: "V", z: "0.36" },
  "Meghalaya|Shillong (C.S.O.)": { zone: "V", z: "0.36" },
  "Nagaland|Kohima": { zone: "V", z: "0.36" },
  "New Delhi|(Safdarjang)": { zone: "III", z: "0.16" },
  "New Delhi|Delhi": { zone: "IV", z: "0.24" },
  "New Delhi|New Delhi Palam (A)": { zone: "IV", z: "0.24" },
  "Odisha|Bhubaneswar": { zone: "III", z: "0.16" },
  "Odisha|Cuttack": { zone: "III", z: "0.16" },
  "Odisha|Puri": { zone: "III", z: "0.16" },
  "Odisha|Rourkela": { zone: "II", z: "0.10" },
  "Pondicherry|Pondicherry": { zone: "II", z: "0.10" },
  "Punjab|Amritsar (Rajasansi)": { zone: "IV", z: "0.24" },
  "Punjab|Chandigarh": { zone: "IV", z: "0.24" },
  "Punjab|Ludhiana": { zone: "IV", z: "0.24" },
  "Punjab|Patiala": { zone: "III", z: "0.16" },
  "Rajasthan|Ajmer": { zone: "II", z: "0.10" },
  "Rajasthan|Bikaner(P.B.O)": { zone: "III", z: "0.16" },
  "Rajasthan|Jaipur (Sanganer)": { zone: "II", z: "0.10" },
  "Rajasthan|Jodhpur": { zone: "II", z: "0.10" },
  "Rajasthan|Kota (A)": { zone: "II", z: "0.10" },
  "Rajasthan|Udaipur": { zone: "II", z: "0.10" },
  "Sikkim|Gangtok": { zone: "IV", z: "0.24" },
  "Tamil Nadu|Chennai (Minambakkam) (A)": { zone: "III", z: "0.16" },
  "Tamil Nadu|Chennai (Nungambakkam)": { zone: "III", z: "0.16" },
  "Tamil Nadu|Coimbatore (Pilamedu)": { zone: "III", z: "0.16" },
  "Tamil Nadu|Madurai": { zone: "II", z: "0.10" },
  "Tamil Nadu|Salem": { zone: "III", z: "0.16" },
  "Tamil Nadu|Tiruchi": { zone: "II", z: "0.10" },
  "Tamil Nadu|Vellore": { zone: "III", z: "0.16" },
  "Telangana|Hyderabad (A)": { zone: "II", z: "0.10" },
  "Uttar Pradesh|Agra": { zone: "III", z: "0.16" },
  "Uttar Pradesh|Allahabad": { zone: "II", z: "0.10" },
  "Uttar Pradesh|Lucknow (Amausi)": { zone: "III", z: "0.16" },
  "Uttar Pradesh|Varanasi": { zone: "III", z: "0.16" },
  "Uttarakhand|Almora": { zone: "IV", z: "0.24" },
  "Uttarakhand|Dehra Dun": { zone: "IV", z: "0.24" },
  "Uttarakhand|Nainital": { zone: "IV", z: "0.24" },
  "Uttarakhand|Roorkee": { zone: "IV", z: "0.24" },
  "West Bengal|Asansol": { zone: "III", z: "0.16" },
  "West Bengal|Darjeeling": { zone: "IV", z: "0.24" },
  "West Bengal|Durgapur": { zone: "III", z: "0.16" },
  "West Bengal|Kolkata": { zone: "III", z: "0.16" },
};

// Wind speed data keyed by "state|station"
const WIND_DATA = {
  "Andaman and Nicobar Island|Port Blair": 44,
  "Andhra Pradesh|Dolphine Nose/CDR Visakhapatnam": 47,
  "Andhra Pradesh|Kurnool": 39,
  "Andhra Pradesh|Masulipatnam": 47,
  "Andhra Pradesh|Nellore": 50,
  "Andhra Pradesh|Vijayawada": 50,
  "Andhra Pradesh|Vishakhapatnam": 47,
  "Assam|Guwahati (Bhorjar) (A)": 50,
  "Bihar|Gaya": 39,
  "Bihar|Jamshedpur": 47,
  "Bihar|Patna (A)": 47,
  "Bihar|Raipur": 39,
  "Bihar|Ranchi(A)": 39,
  "Chhattisgarh|Bhilai": 39,
  "Goa|Panjim": 39,
  "Gujarat|Ahmedabad": 39,
  "Gujarat|Bhuj (Rudramata) (A)": 50,
  "Gujarat|Rajkot (A)": 39,
  "Gujarat|Surat": 44,
  "Gujarat|Vadodara": 44,
  "Haryana|Ambala": 47,
  "Himachal Pradesh|Mandi": 39,
  "Himachal Pradesh|Shimla": 39,
  "Jammu and Kashmir|Srinagar": 39,
  "Jharkhand|Bokaro": 47,
  "Karnataka|Bangalore (A)": 33,
  "Karnataka|Mangalore (Bajpe) (A)": 39,
  "Karnataka|Mysuru": 33,
  "Kerala|Calicut (Kozhikode)": 47,
  "Kerala|Thiruvananthapuram": 39,
  "Madhya Pradesh|Bhopal (Bairagarh)": 39,
  "Madhya Pradesh|Jabalpur": 47,
  "Maharashtra|Aurangabad (Chikalthana) (A)": 39,
  "Maharashtra|Mumbai (Colaba)": 44,
  "Maharashtra|Mumbai(Bombay) (Santa Cruz)": 44,
  "Maharashtra|Nagpur (Sonegaon)": 44,
  "Maharashtra|Nashik": 39,
  "Maharashtra|Pune": 39,
  "Manipur|Imphal": 47,
  "Nagaland|Kohima": 44,
  "New Delhi|(Safdarjang)": 47,
  "New Delhi|Delhi": 47,
  "New Delhi|New Delhi Palam (A)": 47,
  "Odisha|Bhubaneshwar (A)": 50,
  "Odisha|Bhubaneswar": 50,
  "Odisha|Cuttack": 50,
  "Odisha|Rourkela": 39,
  "Pondicherry|Pondicherry": 50,
  "Punjab|Amritsar (Rajasansi)": 47,
  "Punjab|Chandigarh": 47,
  "Punjab|Ludhiana": 47,
  "Punjab|Patiala": 47,
  "Rajasthan|Ajmer": 47,
  "Rajasthan|Bikaner(P.B.O)": 47,
  "Rajasthan|Jaipur (Sanganer)": 47,
  "Rajasthan|Jodhpur": 47,
  "Rajasthan|Udaipur": 47,
  "Sikkim|Gangtok": 47,
  "Tamil Nadu|Chennai (Minambakkam) (A)": 50,
  "Tamil Nadu|Chennai (Nungambakkam)": 50,
  "Tamil Nadu|Coimbatore (Pilamedu)": 39,
  "Tamil Nadu|Madurai": 39,
  "Tamil Nadu|Tiruchi": 47,
  "Telangana|Hyderabad (A)": 44,
  "Uttar Pradesh|Agra": 47,
  "Uttar Pradesh|Allahabad": 47,
  "Uttar Pradesh|Lucknow (Amausi)": 47,
  "Uttar Pradesh|Varanasi": 47,
  "Uttarakhand|Almora": 47,
  "Uttarakhand|Dehra Dun": 47,
  "Uttarakhand|Nainital": 47,
  "Uttarakhand|Roorkee": 39,
  "West Bengal|Asansol": 47,
  "West Bengal|Darjeeling": 47,
  "West Bengal|Durgapur": 47,
  "West Bengal|Kolkata": 50,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const UNIQUE_STATES = [...new Set(STATIONS_DATA.map((s) => s.state))].sort();

function getStationsForState(state) {
  return STATIONS_DATA.filter((s) => s.state === state);
}

function getWeatherForStation(state, station) {
  const key = `${state}|${station}`;
  const temp = TEMP_DATA[key] || {};
  const zone = ZONE_DATA[key] || {};
  const wind = WIND_DATA[key] || null;
  return {
    wind_speed: wind != null ? String(wind) : null,
    zone: zone.zone || null,
    z_value: zone.z || null,
    max_temp: temp.max != null ? String(temp.max) : null,
    min_temp: temp.min != null ? String(temp.min) : null,
  };
}

// Find nearest station to lat/lng
function findNearestStation(lat, lng) {
  let best = null;
  let bestDist = Infinity;
  for (const s of STATIONS_DATA) {
    const d = Math.hypot(s.lat - lat, s.lng - lng);
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  return best;
}

// ─── LeafletMap sub-component (loaded dynamically) ────────────────────────
function LeafletMapPanel({ onLocationSelected, selectedLat, selectedLng }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (window.L) {
      setMapLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    // Station markers
    const stationIcon = L.divIcon({
      html: `<div style="width:8px;height:8px;background:#90AF13;border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
      className: "",
      iconSize: [8, 8],
      iconAnchor: [4, 4],
    });

    STATIONS_DATA.forEach((s) => {
      const marker = L.marker([s.lat, s.lng], { icon: stationIcon })
        .addTo(map)
        .bindTooltip(`${s.station}<br/><small>${s.state}</small>`, {
          direction: "top",
          offset: [0, -6],
        });

      marker.on("click", () => {
        const weather = getWeatherForStation(s.state, s.station);
        onLocationSelected(s.lat, s.lng, s.state, s.station, weather);
      });
    });

    // Click on map to pick custom location
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      const nearest = findNearestStation(lat, lng);
      if (nearest) {
        const weather = getWeatherForStation(nearest.state, nearest.station);
        onLocationSelected(
          lat.toFixed(4),
          lng.toFixed(4),
          nearest.state,
          nearest.station,
          weather,
          true
        );
      } else {
        onLocationSelected(lat.toFixed(4), lng.toFixed(4), null, null, null, true);
      }
    });

    mapInstanceRef.current = map;
  }, [mapLoaded]);

  // Update marker when coords change from outside
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !selectedLat || !selectedLng) return;
    const L = window.L;
    const lat = parseFloat(selectedLat);
    const lng = parseFloat(selectedLng);
    if (isNaN(lat) || isNaN(lng)) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const pinIcon = L.divIcon({
        html: `<div style="width:14px;height:14px;background:#e53935;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(
        mapInstanceRef.current
      );
    }
    mapInstanceRef.current.setView([lat, lng], 8, { animate: true });
  }, [selectedLat, selectedLng, mapLoaded]);

  return (
    <div style={{ position: "relative", width: "100%", height: "320px", borderRadius: "6px", overflow: "hidden", border: "1px solid #d8e2c4" }}>
      {!mapLoaded && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4e8", zIndex: 10, fontSize: "13px", color: "#666" }}>
          <MapPin size={16} style={{ marginRight: "6px", color: "#90AF13" }} />
          Loading map…
        </div>
      )}
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

// ─── Main dialog ─────────────────────────────────────────────────────────────
export default function ProjectLocationDialog({ onClose, onSave }) {
  const [method, setMethod] = useState("location_name");

  // location_name tab
  const [selectedState, setSelectedState] = useState("");
  const [selectedStation, setSelectedStation] = useState("");
  const [stationSearch, setStationSearch] = useState("");

  // map tab
  const [mapLat, setMapLat] = useState("");
  const [mapLng, setMapLng] = useState("");
  const [mapNearestState, setMapNearestState] = useState("");
  const [mapNearestStation, setMapNearestStation] = useState("");

  // custom data tab
  const [customWind, setCustomWind] = useState("");
  const [customZone, setCustomZone] = useState("Select Zone");
  const [customMaxTemp, setCustomMaxTemp] = useState("");
  const [customMinTemp, setCustomMinTemp] = useState("");

  // derived panel values
  const [panelData, setPanelData] = useState(null);

  const stationsForState = selectedState ? getStationsForState(selectedState) : [];

  const filteredStations = stationSearch
    ? STATIONS_DATA.filter(
        (s) =>
          s.station.toLowerCase().includes(stationSearch.toLowerCase()) ||
          s.state.toLowerCase().includes(stationSearch.toLowerCase())
      ).slice(0, 12)
    : [];

  // When state changes, clear station
  useEffect(() => {
    setSelectedStation("");
    setPanelData(null);
  }, [selectedState]);

  // When station changes, load weather data
  useEffect(() => {
    if (selectedState && selectedStation) {
      const wd = getWeatherForStation(selectedState, selectedStation);
      setPanelData(wd);
    }
  }, [selectedStation, selectedState]);

  // Map location selected
  const handleMapLocationSelected = useCallback(
    (lat, lng, state, station, weather, isCustomClick) => {
      setMapLat(String(lat));
      setMapLng(String(lng));
      if (state) setMapNearestState(state);
      if (station) setMapNearestStation(station);
      if (weather) setPanelData(weather);
    },
    []
  );

  // Apply coords from input
  const handleCoordsApply = () => {
    const lat = parseFloat(mapLat);
    const lng = parseFloat(mapLng);
    if (isNaN(lat) || isNaN(lng)) return;
    const nearest = findNearestStation(lat, lng);
    if (nearest) {
      setMapNearestState(nearest.state);
      setMapNearestStation(nearest.station);
      const wd = getWeatherForStation(nearest.state, nearest.station);
      setPanelData(wd);
    }
  };

  const zoneMap = { II: "0.10", III: "0.16", IV: "0.24", V: "0.36" };

  const applyCustomData = () => {
    if (!customWind || !customMaxTemp || !customMinTemp || customZone === "Select Zone") {
      alert("Please fill all fields");
      return;
    }
    const data = {
      wind_speed: customWind,
      zone: customZone,
      z_value: zoneMap[customZone] || "",
      max_temp: customMaxTemp,
      min_temp: customMinTemp,
    };
    setPanelData(data);
  };

  const handleSave = () => {
    if (method === "location_name") {
      if (!selectedState) { alert("Please select a state"); return; }
      if (!selectedStation) { alert("Please select a station"); return; }
    }
    if (method === "map") {
      if (!mapLat || !mapLng) { alert("Please select a location on the map or enter coordinates"); return; }
    }
    if (method === "custom_data") {
      if (!panelData) { alert("Please apply custom data first"); return; }
    }
    onSave?.({ method, panelData, state: selectedState || mapNearestState, station: selectedStation || mapNearestStation, lat: mapLat, lng: mapLng });
    onClose();
  };

  const renderLocationPage = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ fontWeight: 700, fontSize: "15px", color: "#2d2d2d" }}>
        Search by location name
      </div>

      {/* Quick search across all stations */}
      <div style={{ position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#888", pointerEvents: "none" }} />
        <input
          value={stationSearch}
          onChange={(e) => setStationSearch(e.target.value)}
          placeholder="Search any station across India…"
          style={{ width: "100%", height: "38px", paddingLeft: "32px", paddingRight: "12px", border: "1px solid #ccc", borderRadius: "5px", fontSize: "13px", boxSizing: "border-box" }}
        />
        {filteredStations.length > 0 && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", border: "1px solid #d0d0d0", borderRadius: "5px", boxShadow: "0 4px 12px rgba(0,0,0,0.12)", zIndex: 100, maxHeight: "220px", overflowY: "auto" }}>
            {filteredStations.map((s) => (
              <div
                key={`${s.state}|${s.station}`}
                onClick={() => {
                  setSelectedState(s.state);
                  setSelectedStation(s.station);
                  setStationSearch("");
                }}
                style={{ padding: "8px 12px", cursor: "pointer", fontSize: "13px", borderBottom: "1px solid #f0f0f0" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f9e8")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                <span style={{ fontWeight: 500 }}>{s.station}</span>
                <span style={{ color: "#888", marginLeft: "8px" }}>{s.state}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "16px" }}>
        {/* STATE */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
          <label style={{ fontSize: "13px" }}>State</label>
          <div style={{ position: "relative" }}>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              style={{ width: "100%", height: "38px", paddingLeft: "10px", paddingRight: "28px", border: "1px solid black", borderRadius: "5px", background: "white", appearance: "none", fontSize: "13px" }}
            >
              <option value="">Select State</option>
              {UNIQUE_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>
        </div>

        {/* STATION */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
          <label style={{ fontSize: "13px" }}>Station</label>
          <div style={{ position: "relative" }}>
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              disabled={!selectedState}
              style={{ width: "100%", height: "38px", paddingLeft: "10px", paddingRight: "28px", border: "1px solid black", borderRadius: "5px", background: selectedState ? "white" : "#f5f5f5", appearance: "none", fontSize: "13px" }}
            >
              <option value="">Select Station</option>
              {stationsForState.map((s) => <option key={s.station} value={s.station}>{s.station}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>
        </div>
      </div>

      {selectedStation && (
        <div style={{ padding: "10px 14px", background: "#f5f9e8", borderRadius: "6px", border: "1px solid #d8e2c4", fontSize: "12px", color: "#555" }}>
          <MapPin size={12} style={{ display: "inline", marginRight: "4px", color: "#90AF13" }} />
          {selectedStation}, {selectedState} — {(() => { const s = STATIONS_DATA.find(x => x.state === selectedState && x.station === selectedStation); return s ? `${s.lat.toFixed(4)}°N, ${s.lng.toFixed(4)}°E` : ""; })()}
        </div>
      )}
    </div>
  );

  const renderMapPage = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <LeafletMapPanel
        onLocationSelected={handleMapLocationSelected}
        selectedLat={mapLat}
        selectedLng={mapLng}
      />

      <div style={{ borderTop: "1px solid #d8e2c4", paddingTop: "12px" }}>
        <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "12px" }}>
          Enter Coordinates or Select on Map
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Latitude (°)</label>
            <input
              value={mapLat}
              onChange={(e) => setMapLat(e.target.value)}
              placeholder="e.g. 28.6139"
              style={{ width: "100%", height: "36px", padding: "0 10px", border: "1px solid black", borderRadius: "5px", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Longitude (°)</label>
            <input
              value={mapLng}
              onChange={(e) => setMapLng(e.target.value)}
              placeholder="e.g. 77.2090"
              style={{ width: "100%", height: "36px", padding: "0 10px", border: "1px solid black", borderRadius: "5px", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>
          <button
            onClick={handleCoordsApply}
            style={{ height: "36px", padding: "0 16px", border: "1px solid #90AF13", borderRadius: "5px", background: "white", cursor: "pointer", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" }}
          >
            Find Nearest
          </button>
        </div>

        {mapNearestStation && (
          <div style={{ marginTop: "10px", padding: "8px 12px", background: "#f5f9e8", borderRadius: "5px", border: "1px solid #d8e2c4", fontSize: "12px" }}>
            Nearest station: <strong>{mapNearestStation}</strong>, {mapNearestState}
          </div>
        )}
      </div>
    </div>
  );

  const renderCustomPage = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div style={{ fontWeight: 700, fontSize: "15px" }}>Enter Custom Weather Data</div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <label style={{ width: "220px", fontSize: "13px" }}>Basic Wind Speed (m/s)</label>
        <input
          value={customWind}
          onChange={(e) => setCustomWind(e.target.value)}
          placeholder="e.g. 50"
          style={{ flex: 1, height: "36px", padding: "0 10px", border: "1px solid black", borderRadius: "5px", fontSize: "13px" }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <label style={{ width: "220px", fontSize: "13px" }}>Seismic Zone</label>
        <div style={{ position: "relative", flex: 1 }}>
          <select
            value={customZone}
            onChange={(e) => setCustomZone(e.target.value)}
            style={{ width: "100%", height: "36px", padding: "0 28px 0 10px", border: "1px solid black", borderRadius: "5px", appearance: "none", fontSize: "13px" }}
          >
            <option>Select Zone</option>
            <option>II</option><option>III</option><option>IV</option><option>V</option>
          </select>
          <ChevronDown size={14} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        </div>
        <input
          readOnly
          value={zoneMap[customZone] || ""}
          placeholder="Zone Factor"
          style={{ width: "110px", height: "36px", padding: "0 10px", border: "1px solid #d0d0d0", borderRadius: "5px", background: "#f5f5f5", color: "#707070", fontSize: "13px" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "13px" }}>Shade Air Temperature (°C)</label>
        <div style={{ display: "flex", gap: "12px" }}>
          <input
            value={customMaxTemp}
            onChange={(e) => setCustomMaxTemp(e.target.value)}
            placeholder="Max"
            style={{ flex: 1, height: "36px", padding: "0 10px", border: "1px solid black", borderRadius: "5px", fontSize: "13px" }}
          />
          <input
            value={customMinTemp}
            onChange={(e) => setCustomMinTemp(e.target.value)}
            placeholder="Min"
            style={{ flex: 1, height: "36px", padding: "0 10px", border: "1px solid black", borderRadius: "5px", fontSize: "13px" }}
          />
        </div>
      </div>

      <button
        onClick={applyCustomData}
        style={{ alignSelf: "flex-start", padding: "8px 24px", border: "1px solid #90AF13", borderRadius: "6px", background: "white", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#90AF13")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
      >
        Apply
      </button>
    </div>
  );

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(1px)" }}
      onClick={onClose}
    >
      <div
        style={{ width: "1100px", maxWidth: "96vw", maxHeight: "90vh", background: "#f5f5f5", border: "1px solid #90AF13", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", borderRadius: "4px", overflow: "hidden", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div style={{ height: "44px", borderBottom: "1px solid #90AF13", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", background: "white" }}>
          <span style={{ fontSize: "16px", fontWeight: 600 }}>Project Location</span>
          <button onClick={onClose} style={{ width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", borderRadius: "4px" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#ececec")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px", flex: 1, overflowY: "auto" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: "28px", marginBottom: "20px" }}>
            {[
              { label: "Enter Location Name", value: "location_name" },
              { label: "Select on Map", value: "map" },
              { label: "Input Custom Data", value: "custom_data" },
            ].map((tab) => (
              <button key={tab.value} onClick={() => setMethod(tab.value)} style={{ display: "flex", alignItems: "center", gap: "8px", border: "none", background: "transparent", cursor: "pointer", padding: 0, fontSize: "14px" }}>
                <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid #90AF13", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {method === tab.value && <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#90AF13" }} />}
                </div>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main body */}
          <div style={{ display: "flex", gap: "20px" }}>
            {/* Left panel */}
            <div style={{ flex: 1, background: "white", border: "1px solid #d8e2c4", borderRadius: "10px", padding: "20px" }}>
              {method !== "custom_data" && (
                <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600 }}>Design Code</label>
                  <div style={{ position: "relative", width: "200px" }}>
                    <select style={{ width: "100%", height: "36px", paddingLeft: "10px", paddingRight: "28px", border: "1px solid black", borderRadius: "5px", appearance: "none", fontSize: "13px" }}>
                      <option>IRC 6 (2017)</option>
                    </select>
                    <ChevronDown size={14} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </div>
              )}

              {method === "location_name" && renderLocationPage()}
              {method === "map" && renderMapPage()}
              {method === "custom_data" && renderCustomPage()}
            </div>

            {/* Right panel */}
            <div style={{ width: "270px", background: "#f7fbf1", border: "1px solid #90AF13", borderRadius: "10px", padding: "20px", flexShrink: 0 }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#4c6b10", marginBottom: "16px" }}>
                {method === "custom_data" ? "Custom Values:" : "IRC 6 (2017) Values:"}
              </div>

              <div style={{ fontSize: "13px", marginBottom: "12px", lineHeight: 1.6 }}>
                <span style={{ color: "#666" }}>Basic Wind Speed (m/sec):</span><br />
                <strong>{panelData?.wind_speed ?? "—"}</strong>
              </div>

              <div style={{ fontSize: "13px", marginBottom: "12px", lineHeight: 1.6 }}>
                <span style={{ color: "#666" }}>Seismic Zone:</span><br />
                <strong>{panelData?.zone ?? "—"}</strong>
                {panelData?.z_value && <span style={{ color: "#666" }}> &nbsp;(Z = {panelData.z_value})</span>}
              </div>

              <div style={{ fontSize: "13px", marginBottom: "16px", lineHeight: 1.6 }}>
                <span style={{ color: "#666" }}>Shade Air Temperature (°C):</span><br />
                <strong>
                  {panelData?.max_temp != null ? `Max: ${panelData.max_temp}` : "Max: —"}{" / "}
                  {panelData?.min_temp != null ? `Min: ${panelData.min_temp}` : "Min: —"}
                </strong>
              </div>

              {method !== "custom_data" && (selectedStation || mapNearestStation) && (
                <div style={{ padding: "8px 10px", background: "white", borderRadius: "6px", border: "1px solid #d8e2c4", fontSize: "12px", color: "#555" }}>
                  <div style={{ fontWeight: 600, marginBottom: "2px" }}>{selectedStation || mapNearestStation}</div>
                  <div>{selectedState || mapNearestState}</div>
                </div>
              )}

              {!panelData && (
                <div style={{ fontSize: "12px", color: "#aaa", fontStyle: "italic" }}>
                  Select a location to see weather data
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
            <button
              onClick={handleSave}
              style={{ minWidth: "90px", padding: "8px 20px", border: "1px solid #90AF13", borderRadius: "6px", background: "white", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#90AF13")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              OK
            </button>
            <button
              onClick={onClose}
              style={{ minWidth: "90px", padding: "8px 20px", border: "1px solid #ccc", borderRadius: "6px", background: "white", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#ececec")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}