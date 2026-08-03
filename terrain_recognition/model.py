import tensorflow as tf
from tensorflow import keras
from keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from keras.preprocessing.image import ImageDataGenerator

# Define the model architecture
num_classes = 5
model = keras.Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
    MaxPooling2D((2, 2)),
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),
    Conv2D(128, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),
    Flatten(),
    Dense(128, activation='relu'),
    Dense(num_classes, activation='softmax')  # Adjust num_classes for your terrain types
])

# Compile the model
model.compile(optimizer='adam',
              loss='categorical_crossentropy',
              metrics=['accuracy'])

# Data preprocessing and augmentation
datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest'
)

# Load and preprocess your dataset
train_generator = datagen.flow_from_directory(
    r'C:\Laptop remains\STUTI\Programa\Stock Predictor\Terrain_Recognition\terrain_dataset',  # Path to your training data
    target_size=(224, 224),  # Adjust to your desired image size
    batch_size=32,
    class_mode='categorical'
)

# Train the model
model.fit(
    train_generator,
    epochs=10,  # Adjust the number of training epochs
)

# Save the trained model for future use
model.save('terrain_recognition_model.h5')

# You can now use the trained model to make predictions on new images.
