website: [Terrain Recognition App](https://terrainrecognitionusingcnn-2210.streamlit.app/)</br>  
</br>

**PROBLEM :**  
Recognizing types of terrain from satellite or aerial imagery is a crucial task in areas such as remote sensing, military planning, environmental monitoring, and geospatial analysis.  
This project offers a lightweight yet functional solution that allows users to:  
- Upload satellite images and receive terrain classification
- Understand model confidence in its predictions
- Use a clean, interactive interface for real-time terrain recognition

**TASK :**  
Build a terrain classification app using:
* Streamlit - interactive web interface
* TensorFlow/Keras - Convolutional Neural Network (CNN) for image classification
* PIL & NumPy - image preprocessing
* Matplotlib/Seaborn - model evaluation visualizations

**ACTION :**
1. Trained a 3-layer CNN using TensorFlow/Keras on a dataset of labeled terrain images.
2. Preprocessed input images (grayscale, resized, normalized).
3. Developed a simple web interface using Streamlit to allow users to upload images.
4. Integrated model prediction output with visual cues and confidence levels.
5. Evaluated the model using metrics like accuracy, AUC, and confusion matrix.

**RESULT :**
* Functional Streamlit web app capable of classifying terrain types.
* User-friendly interface displaying both predictions and confidence scores.
* Clear visualization of model performance metrics and diagnostic charts.

**FUTURE ENHANCEMENT :**
* Expand dataset to include more diverse terrain categories.
* Enable batch image predictions and map overlays.
* Integrate with GPS/GeoTIFF data for contextual predictions.
* Add multilingual support and accessibility features.

This project demonstrates the application of deep learning in environmental and geospatial analysis, combining effective image classification with an accessible web interface.
