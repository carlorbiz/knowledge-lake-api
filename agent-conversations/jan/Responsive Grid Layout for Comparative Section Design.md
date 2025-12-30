Jan I need to create a 2-column grid that flows down not across for this comparative "Why this approach works" section but I can't work out how to set the rows to the same height to ensure the content looks like a comparison! Help?
G'day Carla! Right, I can see you're wrestling with Elementor's grid layout. The trick here is getting those comparison items to sit side-by-side at equal heights whilst flowing downward. Let me walk you through the cleanest approach.

The Solution: Container with CSS Grid

Instead of fighting with Elementor's default flow, you want to:

Create a parent Container for your entire comparison section
Set the Container layout to Grid (not Flexbox)
Configure it as 2 columns with equal heights
Here's precisely how:

Step 1: Container Settings

Select your parent Container (the one holding all comparison items)
In the Layout tab → Container → select Grid
Set Columns: 2
Set Rows: Auto (this lets it flow down naturally)
Step 2: Equal Heights

Still in Layout settings
Look for Align Items → set to Stretch
Under Advanced → look for Min Height on child containers → set a fixed value (e.g., 200px) OR
Better yet: In the Grid settings, enable Grid Auto Flow: Row (default)
Step 3: Child Container Settings For each comparison item (the child Containers):

Select each child Container
Advanced tab → Dimensions
Set Height: 100% (this makes them fill the grid cell)
Step 4: Fine-tuning

Gap between columns: Container → Layout → Column Gap (try 20-30px)
Gap between rows: Row Gap (same value for consistency)
If you're still getting uneven heights, there's likely content inside pushing things around. Check:

Text Editor widgets inside: ensure they're not set to specific heights
Images: make sure they're set to Object Fit: Cover if needed
Padding: keep consistent padding on all child Containers
Quick CSS fix (if Elementor's being stubborn): Add this Custom CSS to your parent Container (Advanced → Custom CSS):

Copyselector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 1fr;
  gap: 20px;
}

selector > * {
  display: flex;
  flex-direction: column;
}
That grid-auto-rows: 1fr is the magic—it forces each row to have equal-height cells.

Does this make sense, or would you like me to look at the specific elements you're working with? I can see your structure has multiple nested Containers, so if you point me to which section you're building, I can be more surgical about it.

Deep Research
But it won't let me paste the text content under the heading - it pastes to the right of it. What am I missing to set this to paste beneath?
Ah, classic Elementor quirk! You've got a horizontal layout (Flexbox row) when you need a vertical stack.

The problem: Your Container is set to flow horizontally (left-to-right), so everything you add goes to the right of the previous element instead of below it.

The fix:

Select the Container that holds your heading (the parent Container)
Go to Layout tab
Look for Direction or Flex Direction
Change it from Row (horizontal →) to Column (vertical ↓)
That should immediately stack your heading and text vertically.

If you can't find "Direction":

Make sure the Container layout is set to Flexbox (not Grid)
The setting might be called Flex Direction with icons showing horizontal vs vertical arrows
Look under Layout → Container section
Alternative quick fix:

Click the + button below the heading (not beside it)
If you only see a + to the right, that confirms your Container is in row mode
After you paste, you can also try right-clicking the text element → Move Up to position it below the heading
Still pasting sideways? You might have accidentally created a nested Container. Check your Structure panel (left side) to see if your heading is inside its own Container. If so, you want to add the text to the parent Container, not the same one as the heading.

Give that a crack and let me know if it's still being difficult?