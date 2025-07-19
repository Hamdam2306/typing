import Component from "@/components/ui/table-all";
import { Navbar } from "./navbar";

const Leadboard = () => {
    return (
        <div>
            <Navbar />
            <div className="flex justify-center">
                <Component />
            </div>
        </div>
    );
}

export default Leadboard;