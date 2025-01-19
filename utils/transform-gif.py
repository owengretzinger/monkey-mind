from PIL import Image
import os

# # transform to white for coloring programmatically
# COLOR_MAP = {
#     "#795e5c": "#ffffff",  # Replace fur with white
#     "#38282e": "#383838",  # Replace stroke with grey
#     "#d99570": "transparent",  # Replace skin with transparent
#     "#ffffff": "#ffffff",  # keep white
# }
# DEFAULT_COLOR = "#383838"  # default anti aliasing color to stroke

# # extract skin
# COLOR_MAP = {
#     "#d99570": "#d99570",  # keep skin
#     "#ffffff": "#ffffff",  # keep white
#     "#795e5c": "transparent",  # remove fur
#     "#38282e": "transparent",  # remove stroke
# }
# DEFAULT_COLOR = "transparent"  # remove anti aliasing color

# extract fur
COLOR_MAP = {
    "#d99570": "transparent",  # remove skin
    "#ffffff": "transparent",  # remove white
    "#795e5c": "#795e5c",  # keep fur
    "#38282e": "#38282e",  # keep stroke
}
DEFAULT_COLOR = "#38282e"  # default anti aliasing color to stroke

# Settings
COLOR_TOLERANCE = 5


def get_color_distance(color1_hex, color2_hex):
    # Convert hex to RGB
    r1, g1, b1 = (
        int(color1_hex[1:3], 16),
        int(color1_hex[3:5], 16),
        int(color1_hex[5:7], 16),
    )
    r2, g2, b2 = (
        int(color2_hex[1:3], 16),
        int(color2_hex[3:5], 16),
        int(color2_hex[5:7], 16),
    )

    # Calculate Euclidean distance
    return ((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2) ** 0.5


def replace_colors(image_path, color_mapping, output_path):
    # Open the GIF
    with Image.open(image_path) as img:
        frames = []
        # Create a transparent background
        background = Image.new("RGBA", img.size, (0, 0, 0, 0))

        try:
            while True:
                # Convert frame to RGBA
                current = img.convert("RGBA")

                # Create a new composition starting with a fresh background
                composition = background.copy()

                # Get frame data as list of pixels
                data = list(current.getdata())
                new_data = []

                # Process each pixel
                for pixel in data:
                    # Convert pixel to hex format for comparison
                    hex_color = "#{:02x}{:02x}{:02x}".format(
                        pixel[0], pixel[1], pixel[2]
                    )

                    # Check for exact match or similar color
                    matched_color = None
                    for map_color in color_mapping:
                        if (
                            hex_color.lower() == map_color
                            or get_color_distance(hex_color, map_color)
                            <= COLOR_TOLERANCE
                        ):
                            matched_color = color_mapping[map_color]
                            break

                    if matched_color:
                        if matched_color.lower() == "transparent":
                            new_data.append((0, 0, 0, 0))  # Transparent pixel
                        else:
                            # Convert hex to RGB and maintain original alpha
                            r = int(matched_color[1:3], 16)
                            g = int(matched_color[3:5], 16)
                            b = int(matched_color[5:7], 16)
                            new_data.append((r, g, b, pixel[3]))
                    else:
                        # Handle unmapped colors based on DEFAULT_COLOR setting
                        if DEFAULT_COLOR == "original":
                            new_data.append(pixel)
                        elif DEFAULT_COLOR == "transparent":
                            new_data.append((0, 0, 0, 0))
                        else:
                            r = int(DEFAULT_COLOR[1:3], 16)
                            g = int(DEFAULT_COLOR[3:5], 16)
                            b = int(DEFAULT_COLOR[5:7], 16)
                            new_data.append((r, g, b, pixel[3]))

                # Create new frame with modified colors
                new_frame = Image.new("RGBA", current.size)
                new_frame.putdata(new_data)

                # Compose the frame on a fresh background
                composition.paste(new_frame, (0, 0), new_frame)
                frames.append(composition.copy())

                # Move to next frame
                img.seek(img.tell() + 1)
        except EOFError:
            pass

        # Save with disposal mode
        frames[0].save(
            output_path,
            save_all=True,
            append_images=frames[1:],
            optimize=False,
            duration=img.info.get("duration", 100),
            loop=0,
            disposal=2,  # Clear the frame before rendering next frame
        )


def process_directory(input_dir, output_dir, color_map):
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Process each GIF in the input directory
    for filename in os.listdir(input_dir):
        if filename.lower().endswith(".gif"):
            input_path = os.path.join(input_dir, filename)
            output_path = os.path.join(output_dir, filename)
            replace_colors(input_path, color_map, output_path)
            print(f"Processed: {filename}")


# Example usage
if __name__ == "__main__":
    input_dir = "input-gifs"
    output_dir = "output-gifs"

    process_directory(input_dir, output_dir, COLOR_MAP)
