Do you ever get lost in your document, and not know where you are? Make your Roam Research headings 'sticky' so that when you scroll down your headings stick at the top of the page.

**New:**
- now compatible with Augmented Headings extension, which allows H4-H6 level headings in addition to the Roam native H1-H3

No configuration is required. When the extension is loaded you have two options to turn on Sticky Headings such that any blocks set as headings in your graph will be sticky:
1. via Command Palette using 'Toggle Sticky Headings'
2. using a keyboard shortcut ALT-SHIFT-s

Both of these will toggle Sticky Headings on and off.

![sticky-headings](https://user-images.githubusercontent.com/6857790/201614328-7db283d0-15f0-41b7-8c6a-3f0e44d48ef7.gif)

The extension will adjust for any css tweaks you apply, including using themes or even Roam Studio and Roam "Native" Dark. Just make sure to toggle the Sticky Headings state after changing your styles and the extension will pick up the new styles and correct for them. If you find a theme in which the headings don't render properly, please let me know!

**Note:**
In order to determine the height of the headings, the extension looks for headings on your page and gets their calculated height from css. If you don't have any headings on your page it won't be able to do so. In that case, add some headings of H1, H2 and H3 and then toggle Sticky Headings. It will then re-calculate the size and you should be right to go.
