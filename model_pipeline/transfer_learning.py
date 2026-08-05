import tensorflow as tf
from tensorflow import keras
from keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, GlobalAveragePooling2D
from keras.applications import MobileNetV2

def build_custom_cnn(input_shape=(224, 224, 3), num_classes=5):
    """Baseline CNN model architecture."""
    model = keras.Sequential([
        Conv2D(32, (3, 3), activation='relu', input_shape=input_shape, name='conv1'),
        MaxPooling2D((2, 2)),
        Conv2D(64, (3, 3), activation='relu', name='conv2'),
        MaxPooling2D((2, 2)),
        Conv2D(128, (3, 3), activation='relu', name='conv3'),
        MaxPooling2D((2, 2)),
        Flatten(),
        Dense(128, activation='relu'),
        Dropout(0.3),
        Dense(num_classes, activation='softmax', name='predictions')
    ])
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    return model

def build_transfer_learning_model(input_shape=(224, 224, 3), num_classes=5, freeze_backbone=True):
    """MobileNetV2 Transfer Learning Architecture for high accuracy terrain classification."""
    base_model = MobileNetV2(
        input_shape=input_shape,
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = not freeze_backbone

    inputs = keras.Input(shape=input_shape)
    x = keras.applications.mobilenet_v2.preprocess_input(inputs)
    x = base_model(x, training=False)
    x = GlobalAveragePooling2D()(x)
    x = Dropout(0.3)(x)
    outputs = Dense(num_classes, activation='softmax', name='predictions')(x)

    model = keras.Model(inputs, outputs)
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-4),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    return model
