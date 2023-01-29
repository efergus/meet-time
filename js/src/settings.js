

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

function Time({time, selected, onMouse}) {
    const classes = (selected ? ["selected"] : []).concat(["calendar-day"])
    return (
        <div className={classes.join(" ")} {...mouseCallbacks(x=>onMouse(x.buttons, x))}>
            {(time+11)%12 + 1 + ":00"}
        </div>
    )
}

function NextDays({year, month, date, count, isSelected, onMouse}) {
    const labels = new Array(count).fill(null).map((_, i)=><DayOfWeek key={i} number={dayOfWeek(year, month, i+date)}/>);
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


function TimeSelect({count, isSelected, onMouse}) {
    let times = new Array(count).fill(null).map((_, i)=>{
        return <Time key={i} time={i} selected={isSelected(i)} onMouse={e=>onMouse(i, e)}/>
    });
    const style = {
        gridTemplateRows: `repeat(${count}, 1fr)`,
        gridTemplateColumns: "min-content 1fr",
    }
    return (
        <div className="calendar">
            <div className="hour-grid noselect" style={style}>
                {times}
            </div>
        </div>
    )
}

function Form({times, duration}) {
    const value =[duration].concat(times).map(x=>x.toString(16)).join(",");
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
    const [timeRange, setTimeRange] = React.useState([8, 16]);
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
    const handleMouseTime = (selection, buttons)=>{
        if(buttons) {
            if(selection <= timeRange[0] + 1){
                setTimeRange([selection, Math.min(selection+timeRange[1]-timeRange[0], 23)]);
            }
            else{
                setTimeRange([timeRange[0], selection]);
            }
        }
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
    const timeCallbacks = {
        onMouse: handleMouseTime,
        isSelected: time=>time>=timeRange[0] && time<=timeRange[1],
    }
    const startTimes = Object.keys(selections).map(x=>{let d = new Date(parseInt(x)); d.setHours(timeRange[0]); return Math.floor(d.getTime()/1000)});
    return (
        <div>
            <div className="flex hz center">
                <NextDays {...dateInfo} count={5} {...callbacks}/>
                <Calendar {...dateInfo} {...callbacks}/>
                <TimeSelect {...dateInfo} count={24} {...timeCallbacks}/>
            </div>
            <Form times={startTimes} duration={(timeRange[1]-timeRange[0])*3600}/>
        </div>
    );
}

const domContainer = document.getElementById('root');
const root = ReactDOM.createRoot(domContainer);
root.render(React.createElement(SettingsRoot));