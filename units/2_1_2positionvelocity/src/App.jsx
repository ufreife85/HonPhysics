import React, { useState } from 'react';


const totalSteps = 51;

export default function Lesson() {
  const [step, setStep] = useState(1);

  const handleNext = () => {
    setStep((s) => Math.min(s + 1, totalSteps));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const renderContent = () => {
    const content = [
      // Step 1
      {
        title: "Unit 2.1 & 2.2: Position, Displacement, & Average Velocity",
        body: "Welcome to our study of motion!"
      },
      // Step 2
      {
        title: "Introduction to Kinematics",
        body: "In this unit, we begin our exploration of **kinematics**: the science of describing motion. We'll look at *how* things move, without yet considering *why* they move (that comes later!)."
      },
      // Step 3
      {
        title: "One-Dimensional Motion",
        body: "To keep things simple, we'll start by focusing on motion in **one dimension**. This means objects moving in a straight line, like a car on a straight road or a ball dropped from a cliff."
      },
      // Step 4
      {
        title: "Recap: Scalars and Vectors",
        body: "Before we go further, let's remember a key concept from Unit 1: the difference between scalars and vectors. This is crucial for understanding motion."
      },
      // Step 5
      {
        title: "Recap: Scalars",
        body: "A **scalar** is a quantity that has only **magnitude** (a size or amount). Examples include temperature (20°C), mass (5 kg), and time (15 s)."
      },
      // Step 6
      {
        title: "Recap: Vectors",
        body: "A **vector** is a quantity that has both **magnitude and direction**. We often draw them as arrows. Examples include force (10 N downwards) and, as we'll see, displacement and velocity."
      },
      // Step 7
      {
        title: "Section 2.1: Position & Displacement",
        body: "Let's define the fundamental ideas needed to describe motion."
      },
      // Step 8
      {
        title: "Frame of Reference",
        body: "To describe an object's motion, we must first agree on a **frame of reference**. This is a viewpoint from which you measure things. For now, we'll use the ground as our frame of reference."
      },
      // Step 9
      {
        title: "Coordinate System",
        body: "A frame of reference is defined by a **coordinate system**. It gives us a way to specify locations in space."
      },
      // Step 10
      {
        title: "The Number Line",
        body: "For one-dimensional motion, our coordinate system can be a simple number line. It has an origin (0), a positive direction, and a negative direction."
      },
      // Step 11
      {
        title: "Coordinate System",
        img: "./images/coordinate_system.png",
        caption: "A standard one-dimensional coordinate system."
      },
      // Step 12
      {
        title: "Position (x)",
        body: "An object's **position (x)** is its specific location within the coordinate system. It's where the object *is* at a particular moment."
      },
      // Step 13
      {
        title: "Position is a Vector",
        body: "Because position is measured from an origin and has a direction (positive or negative), it is a **vector** quantity."
      },
      // Step 14
      {
        title: "Position Example 1",
        body: "A car is at position **x = +10 m**. This tells us it is 10 meters from the origin, in the positive direction."
      },
      // Step 15
      {
        title: "Position Example 1",
        img: "./images/car_position_positive.png",
        caption: "The car is at a positive position."
      },
      // Step 16
      {
        title: "Position Example 2",
        body: "Another car is at position **x = -5 m**. This means it is 5 meters from the origin, but in the negative direction."
      },
      // Step 17
      {
        title: "Position Example 2",
        img: "./images/car_position_negative.png",
        caption: "The car is at a negative position."
      },
      // Step 18
      {
        title: "Displacement (Δx)",
        body: "Now for a new concept: **Displacement (Δx)** is the **change** in an object's position. It tells you how far an object has moved from its starting point, and in what direction."
      },
      // Step 19
      {
        title: "The Delta Symbol (Δ)",
        body: "In physics and math, the Greek letter **Delta (Δ)** is used to mean 'change in'. So, Δx literally means 'the change in x'."
      },
      // Step 20
      {
        title: "Displacement Formula",
        body: "The formula for displacement is: \n\n **Δx = x_f - x_i** \n\n Where **x_f** is the final position and **x_i** is the initial position."
      },
      // Step 21
      {
        title: "Displacement is a Vector",
        body: "Since displacement is calculated from positions and has a direction (indicated by its sign), it is a **vector** quantity."
      },
      // Step 22
      {
        title: "Displacement Example 1",
        body: "A student walks from a locker (**x_i = +5 m**) to a classroom (**x_f = +15 m**)."
      },
      // Step 23
      {
        title: "Displacement Example 1",
        body: "Let's calculate the displacement: \n\n Δx = x_f - x_i \n Δx = (+15 m) - (+5 m) = **+10 m** \n\n The student's displacement is 10 meters in the positive direction."
      },
      // Step 24
      {
        title: "Displacement Example 1",
        img: "./images/displacement_positive.png",
        caption: "The displacement vector points from the initial to the final position."
      },
      // Step 25
      {
        title: "Displacement Example 2",
        body: "Now, the student walks back from the classroom (**x_i = +15 m**) to the locker (**x_f = +5 m**)."
      },
      // Step 26
      {
        title: "Displacement Example 2",
        body: "Let's calculate the new displacement: \n\n Δx = x_f - x_i \n Δx = (+5 m) - (+15 m) = **-10 m** \n\n The displacement is 10 meters in the **negative** direction."
      },
      // Step 27
      {
        title: "Displacement Example 2",
        img: "./images/displacement_negative.png",
        caption: "The displacement vector now points in the negative direction."
      },
      // Step 28
      {
        title: "Distance",
        body: "So how is this different from **distance**? Distance is the **total path length** an object has traveled, regardless of direction."
      },
      // Step 29
      {
        title: "Distance is a Scalar",
        body: "Distance does not have a direction, so it is a **scalar** quantity. It's always a positive number."
      },
      // Step 30
      {
        title: "Distance vs. Displacement",
        body: "Let's compare them. A runner jogs 40 m East, then turns around and jogs 10 m West."
      },
      // Step 31
      {
        title: "Distance vs. Displacement",
        body: "The total **distance** is the sum of the paths: \n\n Distance = 40 m + 10 m = **50 m**."
      },
      // Step 32
      {
        title: "Distance vs. Displacement",
        body: "The **displacement** is the change in position. Let East be the positive direction. \n\n x_i = 0 m \n x_f = +40 m - 10 m = +30 m \n\n Δx = x_f - x_i = **+30 m**."
      },
      // Step 33
      {
        title: "Distance vs. Displacement",
        img: "./images/distance_vs_displacement.png",
        caption: "The distance is the full path (50 m), while displacement is the net change in position (30 m)."
      },
      // Step 34
      {
        title: "Section 2.2: Average Velocity",
        body: "Now that we can describe *where* an object is and how its position *changes*, let's describe *how fast* it changes."
      },
      // Step 35
      {
        title: "Speed vs. Velocity",
        body: "In everyday language, we use 'speed' and 'velocity' to mean the same thing. In physics, they are different. \n\n **Speed** is how fast you are going (a scalar). \n **Velocity** is how fast you are going *and in what direction* (a vector)."
      },
      // Step 36
      {
        title: "Average Velocity (v_avg)",
        body: "The **average velocity** is the displacement divided by the time interval over which that displacement occurred."
      },
      // Step 37
      {
        title: "Average Velocity Formula",
        body: "The formula for average velocity is: \n\n **v_avg = Δx / Δt = (x_f - x_i) / (t_f - t_i)**"
      },
      // Step 38
      {
        title: "Units of Velocity",
        body: "The SI unit for velocity is **meters per second (m/s)**."
      },
      // Step 39
      {
        title: "Velocity is a Vector",
        body: "Since velocity depends on displacement (a vector), velocity is also a **vector**. Its sign will be the same as the displacement's sign."
      },
      // Step 40
      {
        title: "Average Velocity Example",
        body: "Remember the student who walked to the classroom? Their displacement was **Δx = +10 m**. Let's say it took them **Δt = 8.0 s**."
      },
      // Step 41
      {
        title: "Average Velocity Example",
        body: "Let's calculate their average velocity: \n\n v_avg = Δx / Δt \n v_avg = (+10 m) / (8.0 s) = **+1.25 m/s**."
      },
      // Step 42
      {
        title: "Average Speed",
        body: "A related concept is **average speed**, which is the total distance traveled divided by the time interval."
      },
      // Step 43
      {
        title: "Average Speed Formula",
        body: "The formula is: \n\n **Average Speed = Total Distance / Δt** \n\n Since distance is a scalar, average speed is also a scalar."
      },
      // Step 44
      {
        title: "Average Speed Example",
        body: "Let's look at our jogger again. They traveled a **distance of 50 m**. Let's say this took them **Δt = 20 s**."
      },
      // Step 45
      {
        title: "Average Speed Example",
        body: "Average Speed = (50 m) / (20 s) = **2.5 m/s**."
      },
      // Step 46
      {
        title: "Comparing the Two",
        body: "What was the jogger's average velocity? Their displacement was **Δx = +30 m** and the time was **Δt = 20 s**."
      },
      // Step 47
      {
        title: "Comparing the Two",
        body: "v_avg = (+30 m) / (20 s) = **+1.5 m/s**."
      },
      // Step 48
      {
        title: "Comparing the Two",
        body: "Notice that the average speed (2.5 m/s) and the magnitude of the average velocity (1.5 m/s) are different! This is often the case."
      },
      // Step 49
      {
        title: "Graphical Interpretation",
        body: "On a **position-time (x-t) graph**, the average velocity between two points is the **slope** of the straight line that connects them (this is called a 'secant line')."
      },
      // Step 50
      {
        title: "Graphical Interpretation",
        img: "./images/xt_graph_slope.png",
        caption: "Slope = Rise / Run = Δx / Δt = Average Velocity"
      },
      // Step 51
      {
        title: "End of Lesson",
        body: "Great job! You now have the fundamental tools to describe motion in one dimension."
      }
    ];

    const current = content[step - 1];

    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-indigo-400 mb-4">{current.title}</h2>
        {current.body && <p className="text-lg whitespace-pre-wrap max-w-prose mx-auto">{current.body}</p>}
        {current.img && (
          <div className="my-6">
            <img src={current.img} alt={current.caption} className="max-w-md mx-auto rounded-lg shadow-lg bg-zinc-800 p-2" />
            <p className="text-sm text-zinc-400 mt-2">{current.caption}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-800 p-8 transition-all duration-500">
        {renderContent()}
      </div>
      <div className="flex items-center justify-between w-full max-w-4xl mt-6">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="text-sm text-zinc-400">
          Step {step} / {totalSteps}
        </div>
        <button
          onClick={handleNext}
          disabled={step === totalSteps}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
