from flask import Flask, render_template, url_for, redirect

app = Flask(__name__)

@app.route('/')
def index():
    # Start at the first decision point
    return render_template('index.html')

@app.route('/step/<int:step_number>/<response>')
def step(step_number, response):
    # Decision logic based on step number and yes/no response
    if step_number == 1:
        if response == 'no':
            return render_template('call_resuscitation_team.html')
        else:  # yes response
            return render_template('apply_high_flow_oxygen.html')
    
    elif step_number == 2:
        # Implement logic for step 2 as per the flowchart
        pass
    
    # Continue with additional elif statements for further steps
    
    else:
        # If the step is not recognized, redirect to the start
        return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
