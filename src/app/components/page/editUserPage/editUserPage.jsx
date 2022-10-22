import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { validator } from "../../../utils/validator";
import TextField from "../../common/form/textField";
import SelectField from "../../common/form/selectField";
import RadioField from "../../common/form/radioField";
import MultiSelectField from "../../common/form/multiSelectField";
import BackHistoryButton from "../../common/backButton";
import { useQualities } from "../../../hooks/useQualities";
import { useProfessions } from "../../../hooks/useProfession";
import { useAuth } from "../../../hooks/useAuth";

const EditUserPage = () => {
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState();
    const [errors, setErrors] = useState({});
    const { currentUser, updateUser } = useAuth();
    const { qualities, isLoading: qualLoading } = useQualities();
    const qualitiesList = qualities.map((q) => ({
        label: q.name,
        value: q._id
    }));
    const { professions, isLoading: profLoading } = useProfessions();
    const professionsList = professions.map((p) => ({
        label: p.name,
        value: p._id
    }));
    const getQualities = (elements) => {
        const qualitiesArray = [];
        for (const elem of elements) {
            for (const quality of qualities) {
                if (quality._id === elem) {
                    qualitiesArray.push(quality);
                    break;
                }
            }
        }
        return qualitiesArray;
    };
    const transformData = (data) => {
        const result = getQualities(data).map((qual) => ({
            label: qual.name,
            value: qual._id
        }));
        return result;
    };
    useEffect(() => {
        if (!profLoading && !qualLoading && currentUser && !data) {
            setData({
                ...currentUser,
                qualities: transformData(currentUser.qualities)
            });
        }
    }, [qualLoading, profLoading, currentUser, data]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = validate();
        if (!isValid) return;
        await updateUser({
            ...data,
            qualities: data.qualities.map((q) => q.value)
        });
        history.push(`/users/${data._id}`);
    };
    useEffect(() => {
        if (data) setIsLoading(false);
    }, [data]);

    const validatorConfig = {
        email: {
            isRequired: {
                message: "Электронная почта обязательна для заполнения"
            },
            isEmail: {
                message: "Email введен некорректно"
            }
        },
        name: {
            isRequired: {
                message: "Введите ваше имя"
            }
        }
    };
    useEffect(() => {
        validate();
    }, [data]);
    const handleChange = (target) => {
        setData((prevState) => ({
            ...prevState,
            [target.name]: target.value
        }));
    };
    const validate = () => {
        const errors = validator(data, validatorConfig);
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const isValid = Object.keys(errors).length === 0;
    return (
        <div className="container mt-5">
            <BackHistoryButton />
            <div className="row">
                <div className="col-md-6 offset-md-3 shadow p-4">
                    {!isLoading && Object.keys(professions).length > 0 ? (
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="Имя"
                                name="name"
                                value={data.name}
                                onChange={handleChange}
                                error={errors.name}
                            />
                            <TextField
                                label="Электронная почта"
                                name="email"
                                value={data.email}
                                onChange={handleChange}
                                error={errors.email}
                            />
                            <SelectField
                                label="Выбери свою профессию"
                                defaultOption="Choose..."
                                options={professionsList}
                                name="profession"
                                onChange={handleChange}
                                value={data.profession}
                                error={errors.profession}
                            />
                            <RadioField
                                options={[
                                    { name: "Male", value: "male" },
                                    { name: "Female", value: "female" },
                                    { name: "Other", value: "other" }
                                ]}
                                value={data.sex}
                                name="sex"
                                onChange={handleChange}
                                label="Выберите ваш пол"
                            />
                            <MultiSelectField
                                defaultValue={data.qualities}
                                options={qualitiesList}
                                onChange={handleChange}
                                name="qualities"
                                label="Выберите ваши качества"
                            />
                            <button
                                type="submit"
                                disabled={!isValid}
                                className="btn btn-primary w-100 mx-auto"
                            >
                                Обновить
                            </button>
                        </form>
                    ) : (
                        "Loading..."
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditUserPage;
