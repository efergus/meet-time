

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]


function dayOfWeek(year, month, date=1) {
    return new Date(year, month, date).getDay();
}
function lastDate(year, month) {
    return new Date(year, month+1, 0).getDate();
}
function dateOffset(year, month, date) {
    return new Date(year, month, date+1).getDate();
}
function monthName(year, month) {
    return new Date(year, month+1, 0).toLocaleString('default', { month: 'long' });
}
function dateStr(date) {
    function npad(num, n=2) {
        return num.toString().padStart(n, '0');
    }
    const s = '-';
    return npad(date.getFullYear(), 4)+s+npad(date.getMonth())+s+npad(date.getDate());
}

function isSelecting(pstate, cstate, pselecting, pselected) {
    if(pstate && cstate) {
        return pselecting;
    }
    if(!pstate && cstate) {
        return !pselected;
    }
    if(pstate && !cstate) {
        return pselected;
    }
    return false;
}

function mouseCallbacks(c) {
    return {
        onMouseMove: c,
        onMouseDown: c,
        onMouseUp: c,
    }
}

function DayOfWeek({number}) {
    return (
        <div className="label">
            {daysOfWeek[number][0]}
        </div>
    )
}

function Day({date, selected, onMouse}) {
    const classes = (selected ? ["selected"] : []).concat(["calendar-day"])
    return (
        <div className={classes.join(" ")} {...mouseCallbacks(x=>onMouse(x.buttons, x))}>
            {date.toString()}
        </div>
    )
}

function NextDays({year, month, date, count, isSelected, onMouse}) {
    const start = dayOfWeek(year, month, date);
    const labels = new Array(count).fill(null).map((_, i)=><DayOfWeek key={i} number={(i+start)%(count-1)}/>);
    let days = new Array(count).fill(null).map((_, i)=>{
        const time = new Date(year, month, date+i);
        return <Day key={i} date={time.getDate()} selected={isSelected(time)} onMouse={e=>onMouse([time.getTime(), time], e)}/>
    });
    const style = {
        gridTemplateColumns: `repeat(${count}, 1fr)`,
        gridTemplateRows: "min-content 1fr",
    }
    return (
        <div className="calendar">
            <div className="calendar-grid noselect" style={style}>
                {labels}
                {days}
            </div>
        </div>
    )
}

function Calendar({year, month, onMouse, isSelected}) {
    const start_day = dayOfWeek(year, month);
    const weeks = Math.ceil(38/daysOfWeek.length);
    let days = new Array(weeks*daysOfWeek.length);
    let i = 0;
    for(i=0; i < days.length; i++) {
        const date = new Date(year, month, i-start_day+1);
        days[i] = <Day key={i} date={date.getDate()} selected={isSelected(date)} onMouse={e=>onMouse([date.getTime(), date], e)}/>;
    }
    const labels = new Array(daysOfWeek.length).fill(null).map((_, i)=><DayOfWeek key={i} number={i}/>);
    const leftarrow = "<";
    const rightarrow = ">";
    const selector = <div className="flex hz even"><div>{leftarrow}</div> <div>{monthName(year, month)} {year.toString()}</div> <div>{rightarrow}</div></div>
    return (
        <div className="calendar">
            {selector}
            <div className="calendar-grid noselect">
                {labels}
                {days}
            </div>
        </div>
    )
}

function Form({times, duration}) {
    const value =[duration].concat(times).map(x=>x.toString(16)).join(",");
    console.log(times, value);

    return (
        <form action="create" method="post">
            <input type="hidden" name="selections" value={value}/>
            <input type="text" name="title"></input>
            <input type="submit" value="Submit"/>
        </form>
    );
}

function SettingsRoot() {
    const [mouseState, setMouseState] = React.useState({down: false, selecting: false});
    const [selections, setSelections] = React.useState({});
    const isSelected = selection=>{
        return selection[0] in selections;
    }
    const addSelection = selection=>{
        if(!isSelected(selection)) {
            setSelections({...selections, [selection[0]]: selection[1]});
            return true;
        }
        return false;
    }
    const rmSelection = selection=>{
        if(isSelected(selection)) {
            delete selections[selection[0]];
            return true;
        }
        return false;
    }
    const handleMouse = (selection, buttons)=>{
        const down = buttons > 0;
        const selected = isSelected(selection);
        const selecting = isSelecting(mouseState.down, down, mouseState.selecting, selected);
        if(down || mouseState.down) {
            if(selecting){
                addSelection(selection);
            }
            else {
                rmSelection(selection);
            }
        }
        setMouseState({down, selecting});
    }
    const date = new Date();
    const dateInfo = {
        year: date.getFullYear(),
        month: date.getMonth(),
        date: date.getDate(),
    }
    const callbacks = {
        onMouse: (selection, buttons)=>handleMouse(selection, buttons),
        isSelected: date=>isSelected([date.getTime(), date]),
    }
    return (
        <div>
            <div className="flex hz center">
                <NextDays {...dateInfo} count={5} {...callbacks}/>
                <Calendar {...dateInfo} {...callbacks}/>
            </div>
            <Form times={Object.keys(selections).map(x=>Math.floor(x/1000))} duration={60*60*8}/>
        </div>
    );
}

const domContainer = document.getElementById('root');
const root = ReactDOM.createRoot(domContainer);
root.render(React.createElement(SettingsRoot));